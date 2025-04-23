from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from collections import defaultdict

app = Flask(__name__)
CORS(app)

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
            CALL CompareMultiCountryStatsRangeAggregate(
                '{country_str}',
                '{indicator_str}',
                {start_year},
                {end_year},
                '{disaster_str}'
            )
        """

        cursor.execute(call_query)

        results = []
        while True:
            try:
                result = cursor.fetchall()
                results.extend(result)
                if not cursor.nextset():
                    break
            except mysql.connector.errors.InterfaceError:
                break

        return jsonify(results)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




if __name__ == '__main__':
    app.run(debug=True)
