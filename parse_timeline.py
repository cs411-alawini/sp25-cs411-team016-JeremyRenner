import pandas as pd

cols = ["Country Name", "Country Code", "Indicator Name", "Indicator Code"] + [str(year) for year in range(1960, 2024)]

def parse_tl_csv(filepath): # timeline csv
    df = pd.read_csv(filepath)

    # fortmat to long format
    df_converted = df.melt(
        id_vars=["Country Name", "Country Code", "Indicator Name", "Indicator Code"],
        var_name="Year",
        value_name="Value"
    )

    df_converted["Year"] = pd.to_numeric(df_converted["Year"], errors="coerce").astype("Int64")
    df_converted = df_converted.dropna(subset=["Value"])
    
    return df_converted
