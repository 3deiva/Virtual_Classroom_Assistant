import streamlit as st
import pandas as pd
from datetime import datetime
import time


ts = time.time()
date = datetime.fromtimestamp(ts).strftime("%d-%m-%Y")

csv_file = f"Attendance/Attendance_{date}.csv"


try:
    df = pd.read_csv(csv_file)
   
    st.dataframe(df)
except FileNotFoundError:
    st.error(f"File {csv_file} not found.")
except Exception as e:
    st.error(f"An error occurred: {e}")
