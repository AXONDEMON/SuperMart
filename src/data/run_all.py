import subprocess
import os

# Define the correct scripts directory
scripts_dir = "/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/src/data"

# List of Python script filenames (without 'src/data/' prefix)
files = [
    "ai_model.py",
    "average_basket_size.py",
    "filter_data.py",
    "fullsales.py",
    "geography.py",
    "pca.py",
    "precompute_sales.py",
    "clv.py",
    "forecast.py",
]

# Run all scripts
processes = []
for file in files:
    script_path = os.path.join(scripts_dir, file)

    # Ensure the script exists before running it
    if os.path.exists(script_path):
        print(f"✅ Running {file} ...")
        process = subprocess.Popen(["python3", script_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append((file, process))
    else:
        print(f"❌ Warning: {file} not found. Skipping.")

# Wait for all processes to complete and capture output
for file, process in processes:
    stdout, stderr = process.communicate()

    if process.returncode == 0:
        print(f"✅ {file} executed successfully.")
    else:
        print(f"⚠️ {file} encountered an error:\n{stderr.decode()}")

print("🎯 All scripts have been processed.")