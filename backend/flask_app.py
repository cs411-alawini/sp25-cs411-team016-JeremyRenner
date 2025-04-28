from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from collections import defaultdict
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity


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


# New function to get state-level data
def get_state_profile_data(state):
    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)
        
        # Get state overview information
        cursor.execute("SELECT * FROM State WHERE StateName = %s", (state,))
        overview = cursor.fetchone()
        
        # Get economic growth data
        cursor.execute("""
            SELECT * FROM StateIndustryGrowth 
            WHERE StateName = %s 
            ORDER BY Year
        """, (state,))
        economic_growth = cursor.fetchall()
        
        # Get economic totals data
        cursor.execute("""
            SELECT * FROM StateEconomicTotals 
            WHERE StateName = %s 
            ORDER BY Year
        """, (state,))
        economic_totals = cursor.fetchall()
        
        # Get disasters data
        cursor.execute("""
            SELECT sd.* 
            FROM StateDisasters sd
            JOIN State s ON sd.StateCode = s.StateCode
            WHERE s.StateName = %s
            ORDER BY sd.Year DESC
        """, (state,))
        disasters = cursor.fetchall()
        
        return {
            "overview": overview,
            "economicGrowth": economic_growth,
            "economicTotals": economic_totals,
            "disasters": disasters
        }

    except mysql.connector.Error as err:
        return {"error": str(err)}

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# New endpoint for comparing states
@app.route('/compare_states', methods=['POST'])
def compare_states():
    data = request.json
    states = data.get('states')
    start_year = data.get('startYear')
    end_year = data.get('endYear')

    if not all([states, start_year, end_year]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        connection = mysql.connector.connect(
            host='34.133.249.35',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor(dictionary=True)

        results = []
        for state in states:
            # Get economic totals aggregated data
            cursor.execute("""
                SELECT 
                    StateName,
                    AVG(GDPGrowth) as AvgGDPGrowth,
                    AVG(PersonalIncomeGrowth) as AvgPersonalIncomeGrowth,
                    MAX(GDP) as MaxGDP,
                    MAX(PersonalIncome) as MaxPersonalIncome
                FROM StateEconomicTotals
                WHERE StateName = %s AND Year BETWEEN %s AND %s
                GROUP BY StateName
            """, (state, start_year, end_year))
            
            econ_totals = cursor.fetchone()
            
            # Get disaster count
            cursor.execute("""
                SELECT COUNT(*) as DisasterCount
                FROM StateDisasters sd
                JOIN State s ON sd.StateCode = s.StateCode
                WHERE s.StateName = %s AND sd.Year BETWEEN %s AND %s
            """, (state, start_year, end_year))
            
            disaster_count = cursor.fetchone()
            
            # Combine the data
            if econ_totals:
                state_data = econ_totals
                if disaster_count:
                    state_data['DisasterCount'] = disaster_count['DisasterCount']
                results.append(state_data)
        
        return jsonify(results)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



# New endpoint for state data
@app.route('/state_data', methods=['POST'])
def state_data():
    data = request.json
    state = data.get('state')
    if not state:
        return jsonify({"error": "State is required"}), 400

    result = get_state_profile_data(state)
    return jsonify(result)

# New endpoint to check if a country has state-level data
@app.route('/check_state_data', methods=['POST'])
def check_state_data():
    data = request.json
    country = data.get('country')
    if not country:
        return jsonify({"error": "Country is required"}), 400
        
    # Only US has state-level data for now
    has_state_data = (country == "United States")
    
    return jsonify({"hasStateData": has_state_data})

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




if __name__ == '__main__':
    app.run(debug=True)
