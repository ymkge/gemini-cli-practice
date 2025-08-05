import pandas as pd
import os

# Define file paths
input_file = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/input/AIデータ.xlsx')
output_file = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/output/merged_data.xlsx')

# Desired columns
desired_columns = ['氏名', '部署', '個人番号', '役員報酬', '基本給', '役付', '住宅', '資格', '業務手当', '家族', '通勤', '営業手当', '夜勤', '欠勤', '互助会', '財形', '旅行２', '前払退職金①', '前払退職金②', 'その他', '保険料', '地代']

# Load the Excel file
xls = pd.ExcelFile(input_file)

# Get all sheet names
sheet_names = xls.sheet_names

# Create a list to hold dataframes
df_list = []

# Loop through each sheet and read it into a dataframe
for sheet_name in sheet_names:
    # Read using rows 8, 9, and 10 as a multi-level header
    df = xls.parse(sheet_name, header=[7, 8, 9])
    # Collapse the multi-level header into a single header row
    df.columns = [' '.join(map(str, col)).strip().replace('  ', ' ').replace('nan', '') for col in df.columns.values]
    df_list.append(df)

# Concatenate all dataframes into one
merged_df = pd.concat(df_list, ignore_index=True)

# Find the column for '個人番号'
personal_id_col = next((col for col in merged_df.columns if '個人番号' in col), None)

# If the personal ID column is found, remove rows where it is empty
if personal_id_col:
    merged_df.dropna(subset=[personal_id_col], inplace=True)
    merged_df = merged_df[merged_df[personal_id_col].astype(str).str.strip() != '']

# Filter the dataframe to only include the desired columns
# We need to find the full column names that contain our desired keywords
final_columns = [col for col in merged_df.columns for desired in desired_columns if desired in col]
# Remove duplicates while preserving order
final_columns = sorted(set(final_columns), key=final_columns.index)

filtered_df = merged_df[final_columns]

# Write the filtered dataframe to a new Excel file
filtered_df.to_excel(output_file, index=False)

print(f"Successfully merged {len(sheet_names)} sheets into {output_file}")