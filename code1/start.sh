#!/bin/bash
# Start Python Streamlit app
streamlit run app1.py --server.port 8502 --server.address 0.0.0.0 &

# Start Node.js server
node server.js
