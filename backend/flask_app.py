from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import re
import json
import os
import mysql.connector
from mysql.connector import Error


app = Flask(__name__)
CORS(app)



def deaths_by_disaster(country, year):
    dict1 = {'Tsunami': 0, 'Earthquake': 0, 'Volcano': 0}
    try:
        connection = mysql.connector.connect(
            host='34.28.167.157',
            port=3306,
            user='aaruldhawan',
            password='scarjoe',
            database='test_databoose'
        )
        cursor = connection.cursor()
        query = """
        WITH DisasterTypes AS (
            SELECT 'Tsunami' AS Type
            UNION ALL
            SELECT 'Earthquake'
            UNION ALL
            SELECT 'Volcano'
        )
        SELECT
            dt.Type,
            COALESCE(SUM(dd.Deaths), 0) AS TotalDeaths
        FROM DisasterTypes dt
        LEFT JOIN NaturalDisaster nd
        ON nd.Type = dt.Type
        AND nd.CountryName = %s
        AND nd.Year = %s
        LEFT JOIN DirectDamage dd
        ON nd.DisasterID = dd.DisasterID
        GROUP BY dt.Type;
        """
        cursor.execute(query, (country, year))
        results = cursor.fetchall()
        dict1 = {}
        for row in results:
            dict1[row[0]] = row[1]
    except mysql.connector.Error as err:
        print("Error:", err)

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
        return dict1
    

@app.route('/deaths', methods=['POST'])
def retrieve_deaths():
    data = request.json
    country = data.get('country')
    year = data.get('year')
    deaths =  deaths_by_disaster(country, year)
    return jsonify(deaths)
    



@app.route('/')
def home():
    return 'Welcome to Flask Backend!'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
