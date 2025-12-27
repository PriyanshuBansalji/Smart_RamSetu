# Kidney dataset sample (first 3 rows)
import pandas as pd

df = pd.read_csv('../data/kidney.csv')
print(df.head(3))

# Heart dataset sample (first 3 rows)
df = pd.read_csv('../data/heart.csv')
print(df.head(3))

# Liver dataset sample (first 3 rows)
df = pd.read_csv('../data/liver.csv')
print(df.head(3))

# Cornea dataset sample (first 3 rows)
df = pd.read_csv('../data/cornea.csv')
print(df.head(3))
