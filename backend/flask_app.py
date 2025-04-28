from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from collections import defaultdict
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from functools import wraps




app = Flask(__name__)
CORS(app)

bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # change this!
jwt = JWTManager(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "All fields required"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO Users (Username, Email, PasswordHash) VALUES (%s, %s, %s)",
            (username, email, password_hash)
        )
        connection.commit()
        return jsonify({"message": "User created!"}), 201

    except mysql.connector.errors.IntegrityError:
        return jsonify({"error": "Email or username already exists"}), 409

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        try:
            if connection.is_connected():
                cursor.close()
                connection.close()
        except NameError:
            pass  # connection wasn't established


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Users WHERE Email = %s", (email,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user["PasswordHash"], password):
            token = create_access_token(identity=user["UserID"])
            return jsonify({"token": token, "username": user["Username"]})
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        try:
            if connection.is_connected():
                cursor.close()
                connection.close()
        except NameError:
            pass


def get_country_profile_data(country):
    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Country WHERE CountryName = %s", (country,))
        overview = cursor.fetchone()
        cursor.execute("""
            SELECT * FROM SectoralEconomicImpact 
            WHERE CountryName = %s 
            ORDER BY Year
        """, (country,))
        sectoral = cursor.fetchall()
        cursor.execute("""
            SELECT * FROM NationalEconomicImpact 
            WHERE CountryName = %s 
            ORDER BY Year
        """, (country,))
        national = cursor.fetchall()
        cursor.execute("""
            SELECT 
                nd.Type, nd.Year, nd.Intensity,
                dd.TotalDamage, dd.TotalDamageScale,
                dd.Injuries, dd.Deaths
            FROM NaturalDisaster nd
            JOIN DirectDamage dd ON nd.DisasterID = dd.DisasterID
            WHERE nd.CountryName = %s
            ORDER BY nd.Year DESC
        """, (country,))
        disasters = cursor.fetchall()
        cursor.execute("""
            SELECT Year, Type, COUNT(*) as Count
            FROM NaturalDisaster
            WHERE CountryName = %s AND Year >= 1960
            GROUP BY Year, Type
            ORDER BY Year ASC
        """, (country,))
        timeline_raw = cursor.fetchall()
        timeline = defaultdict(lambda: {"Year": None, "Earthquake": 0, "Tsunami": 0, "Volcano": 0})
        for row in timeline_raw:
            year = row["Year"]
            disaster_type = row["Type"]
            count = row["Count"]
            timeline[year]["Year"] = year
            timeline[year][disaster_type] = count
        timeline_data = sorted(timeline.values(), key=lambda x: x["Year"])

        return {
            "overview": overview,
            "sectoral": sectoral,
            "national": national,
            "disasters": disasters,
            "timeline": timeline_data
        }

    except mysql.connector.Error as err:
        return {"error": str(err)}

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/country_data', methods=['POST'])
def country_data():
    data = request.json
    country = data.get('country')
    if not country:
        return jsonify({"error": "Country is required"}), 400

    result = get_country_profile_data(country)
    return jsonify(result)

@app.route('/compare_data_aggregated', methods=['POST'])
def compare_data_aggregated():
    data = request.json
    countries = data.get('countries')
    indicators = data.get('indicators')
    start_year = data.get('startYear')
    end_year = data.get('endYear')
    disaster_types = data.get('disasterTypes')

    if not all([countries, indicators, start_year, end_year, disaster_types]):
        return jsonify({"error": "Missing required parameters"}), 400

    country_str = ','.join(countries)
    indicator_str = ', '.join(indicators)
    disaster_str = ','.join(disaster_types)

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)

        call_query = f"""
            CALL CompareCountryStats(
                '{country_str}',
                '{indicator_str}',
                {start_year},
                {end_year},
                '{disaster_str}'
            )
        """

        cursor.execute(call_query)

        results = []
        fetched_countries = set()
        while True:
            try:
                result = cursor.fetchall()
                for row in result:
                    results.append(row)
                    fetched_countries.add(row['CountryName'])
                if not cursor.nextset():
                    break
            except mysql.connector.errors.InterfaceError:
                break

        # Add "N/A" entries for missing countries
        for c in countries:
            if c not in fetched_countries:
                na_row = {"CountryName": c}
                for key in indicators:
                    # Extract alias name after AS (or use full if no alias)
                    alias = key.split("AS")[-1].strip() if "AS" in key else key.split('.')[-1]
                    na_row[alias] = "N/A"
                na_row["TotalDisasters"] = "N/A"
                na_row["TotalDeaths"] = "N/A"
                results.append(na_row)
        print(results)
        return jsonify(results)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/global_stats', methods=['POST'])
def global_stats():
    data = request.get_json()
    start_year = data.get('startYear')
    end_year = data.get('endYear')
    disaster_types = data.get('disasterTypes', [])
    indicators = data.get('indicators', [])
    aggregate_by = data.get('aggregateBy', 'Disaster Types')
    sort_option = data.get('sortOption', 'Year (Ascending)')

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)

        # Build select and group-by based on aggregation choice
        if aggregate_by == 'Disaster Types':
            select_clause = "nd.Type AS DisasterType, nd.Year,"
            group_clause = "GROUP BY nd.Type, nd.Year"
        else:  # Individual Disasters
            select_clause = "nd.DisasterID, nd.Type AS DisasterType, nd.Year,"
            group_clause = "GROUP BY nd.DisasterID, nd.Type, nd.Year"

        # Build indicator selects
        indicator_selects = []
        for ind in indicators:
            if ind == 'AvgGDP':
                indicator_selects.append("AVG(ne.GDPAnnualPercentGrowth) AS AvgGDP")
            elif ind == 'AvgCPI':
                indicator_selects.append("AVG(ne.CPI_2010_100) AS AvgCPI")
            elif ind == 'AvgExportGrowth':
                indicator_selects.append("AVG(ne.ExportsAnnualPercentGrowth) AS AvgExportGrowth")
            elif ind == 'AvgImportGrowth':
                indicator_selects.append("AVG(ne.ImportAnnualPercentGrowth) AS AvgImportGrowth")
            elif ind == 'AvgUnemployment':
                indicator_selects.append("AVG(ne.UnemploymentPercent) AS AvgUnemployment")
            elif ind == 'AvgAgrictultureGrowth':
                indicator_selects.append("AVG(se.AgricultureAnnualPercentGrowth) AS AvgAgrictultureGrowth")
            elif ind == 'AvgIndustryGrowth':
                indicator_selects.append("AVG(se.IndustryAnnualPercentGrowth) AS AvgIndustryGrowth")
            elif ind == 'AvgManufacturingGrowth':
                indicator_selects.append("AVG(se.ManufacturingAnnualPercentGrowth) AS AvgManufacturingGrowth")
            elif ind == 'AvgServiceGrowth':
                indicator_selects.append("AVG(se.ServiceAnnualPercentGrowth) AS AvgServiceGrowth")

        indicator_select_sql = ", ".join(indicator_selects)

        # Build the full SQL
        sql = f'''
            SELECT {select_clause} {indicator_select_sql}
            FROM NaturalDisaster nd
            LEFT JOIN DirectDamage dd ON nd.DisasterID = dd.DisasterID
            LEFT JOIN NationalEconomicImpact ne ON nd.CountryName = ne.CountryName AND nd.Year = ne.Year
            LEFT JOIN SectoralEconomicImpact se ON nd.CountryName = se.CountryName AND nd.Year = se.Year
            WHERE nd.Year BETWEEN %s AND %s
        '''

        params = [start_year, end_year]

        if disaster_types:
            placeholders = ','.join(['%s'] * len(disaster_types))
            sql += f' AND nd.Type IN ({placeholders})'
            params.extend(disaster_types)

        sql += f' {group_clause} '

        # Apply sort
        if sort_option == 'Year (Ascending)':
            sql += 'ORDER BY nd.Year ASC'
        elif sort_option == 'Year (Descending)':
            sql += 'ORDER BY nd.Year DESC'
        elif sort_option == 'Indicator (Ascending)' and indicators:
            sql += f'ORDER BY {indicators[0]} ASC'
        elif sort_option == 'Indicator (Descending)' and indicators:
            sql += f'ORDER BY {indicators[0]} DESC'

        cursor.execute(sql, params)
        result = cursor.fetchall()

        # Filter rows that have at least one non-null indicator value
        filtered_result = []
        for row in result:
            indicators_non_null = any(row.get(ind.split(' AS ')[-1]) is not None for ind in indicators)
            if indicators_non_null:
                filtered_result.append(row)

        return jsonify(filtered_result)

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def get_db_connection():
    return mysql.connector.connect(
        host='34.133.249.35',
        port=3306,
        user='aaruldhawan',
        password='scarjoe',
        database='test_databoose'
    )

@app.route('/save_graph', methods=['POST'])
def save_graph():
    data = request.get_json()
    print("Received data in /save_graph:", data)  # <-- NEW DEBUG PRINT

    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get('username')
    graph_title = data.get('graph_title')
    filters = data.get('filters')
    page = data.get('page')

    if not all([username, graph_title, filters, page]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor()

        query = '''
            INSERT INTO SavedGraphs (Username, GraphTitle, Filters, Page)
            VALUES (%s, %s, %s, %s)
        '''
        graph_id = cursor.lastrowid
        cursor.execute(query, (username, graph_title, json.dumps(filters), page))
        graph_id = cursor.lastrowid
        connection.commit()

        return jsonify({"message": "Graph saved successfully!", "graphId": graph_id})

    except mysql.connector.Error as err:
        print("Database error:", err)  # <-- NEW DEBUG PRINT
        return jsonify({"error": str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            username = request.headers.get('Username')
            if not username:
                # If Username is not passed separately, you could decode the token here
                username = 'snehas6'  # TEMPORARY fallback for now
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(username, *args, **kwargs)

    return decorated

@app.route('/saved_graphs', methods=['GET'])
@token_required
def saved_graphs(current_user):
    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)

        query = '''
        SELECT GraphId, GraphTitle, Page, Filters
        FROM SavedGraphs
        WHERE Username = %s
        '''
        cursor.execute(query, (current_user,))
        graphs = cursor.fetchall()

        print("Fetched graphs:", graphs)
        return jsonify(graphs)

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/update_graph_title', methods=['POST'])
@token_required
def update_graph_title(current_user):
    data = request.get_json()
    print("Received data for graph update:", data)  # Debugging

    graph_id = data.get('graphId')
    username = data.get('username')
    new_graph_title = data.get('newGraphTitle')

    if not all([graph_id, username, new_graph_title]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor()

        query = '''
            UPDATE SavedGraphs
            SET GraphTitle = %s
            WHERE GraphID = %s AND Username = %s
        '''
        cursor.execute(query, (new_graph_title, graph_id, username))
        connection.commit()

        return jsonify({'message': 'Graph title updated successfully'})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/delete_graph', methods=['POST'])
def delete_graph():
    data = request.get_json()
    graph_id = data.get('graphId')  # Use GraphID to identify the graph
    username = data.get('username')

    if not all([graph_id, username]):
        print(f"Error: Missing graphId or username. Received data: {data}")
        return jsonify({'error': 'Graph ID and username required'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM SavedGraphs
            WHERE GraphID = %s AND Username = %s
        """, (graph_id, username))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'No matching graph found'}), 404

        return jsonify({'message': 'Graph deleted successfully'})

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



if __name__ == '__main__':
    app.run(debug=True)
