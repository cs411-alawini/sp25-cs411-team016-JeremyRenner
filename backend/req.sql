CREATE TRIGGER after_saved_graph_insert
AFTER INSERT ON SavedGraphs
FOR EACH ROW
BEGIN
    INSERT INTO Logs (ActionType, GraphID, Username, Timestamp, Details)
    VALUES ('INSERT', NEW.GraphID, NEW.Username, NOW(), 'Graph inserted');
END

CREATE TRIGGER after_saved_graph_update
AFTER UPDATE ON SavedGraphs
FOR EACH ROW
BEGIN
    INSERT INTO Logs (ActionType, GraphID, Username, Timestamp, Details)
    VALUES ('UPDATE', NEW.GraphID, NEW.Username, NOW(), CONCAT('Graph updated. Old Filters: ', OLD.Filters, ', New Filters: ', NEW.Filters));
END

CREATE TRIGGER after_saved_graph_delete
AFTER DELETE ON SavedGraphs
FOR EACH ROW
BEGIN
    INSERT INTO Logs (ActionType, GraphID, Username, Timestamp, Details)
    VALUES ('DELETE', OLD.GraphID, OLD.Username, NOW(), 'Graph deleted');
END

CREATE PROCEDURE CompareCountryStats (
    IN countries TEXT,
    IN indicators TEXT,
    IN startYear INT,
    IN endYear INT,
    IN disasterTypes TEXT
)
BEGIN
    SET @query = CONCAT(
        'SELECT 
            ne.CountryName, ',
            indicators,
        ',
            COUNT(DISTINCT nd.DisasterID) AS TotalDisasters,
            SUM(dd.Deaths) AS TotalDeaths
        FROM NationalEconomicImpact ne
        JOIN SectoralEconomicImpact se 
            ON ne.CountryName = se.CountryName AND ne.Year = se.Year
        LEFT JOIN NaturalDisaster nd 
            ON ne.CountryName = nd.CountryName AND ne.Year = nd.Year
        LEFT JOIN DirectDamage dd 
            ON nd.DisasterID = dd.DisasterID
        WHERE FIND_IN_SET(ne.CountryName, "', countries, '") > 0
          AND (FIND_IN_SET(nd.Type, "', disasterTypes, '") > 0 OR nd.Type IS NULL)
          AND ne.Year BETWEEN ', startYear, ' AND ', endYear, '
        GROUP BY ne.CountryName
        ORDER BY ne.CountryName;'
    );

    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END