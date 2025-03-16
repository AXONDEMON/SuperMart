import subprocess

files = [
    "src/data/ai_model.py",
    "src/data/average_basket_size.py",
    "src/data/filter_data.py",
    "src/data/fullsales.py",
    "src/data/geography.py",
    "src/data/mid.py",
    "src/data/newest.py",
    "src/data/precompute_sales.py",
    "src/data/stry.py",
    "src/data/try2.py",
]

processes = [subprocess.Popen(["python", file]) for file in files]

# Wait for all processes to finish
for p in processes:
    p.wait()
