
import pandas as pd
import os

# --- Configuration ---
input_file = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/input/AIデータ.xlsx')
output_file = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/output/merged_data.xlsx')

# This maps the final desired column name to the keyword to find in the messy header.
desired_to_keyword_map = {
    '氏名': '氏名',
    '部署': '課',
    '個人番号': '個人',
    '役員報酬': '役員報酬',
    '基本給': '基本給',
    '役付': '役付',
    '住宅': '住宅',
    '資格': '資格',
    '業務手当': '業務',
    '家族': '家族',
    '通勤': '通勤',
    '営業手当': '営業手当',
    '夜勤': '夜勤',
    '欠勤': '欠勤',
    '互助会': '互助会',
    '財形': '財形',
    '旅行２': '旅行２',
    '前払退職金①': '前払退職金①',
    '前払退職金②': '前払退職金②',
    'その他': 'その他',
    '保険料': '保険料',
    '地代': '地代'
}
desired_columns_ordered = list(desired_to_keyword_map.keys())

# --- Main Logic ---
try:
    xls = pd.ExcelFile(input_file)
    sheet_names = xls.sheet_names

    # 1. Read header and data separately
    header_list = []
    data_list = []
    for sheet_name in sheet_names:
        # Read only the 3 header rows (8, 9, 10)
        header_list.append(xls.parse(sheet_name, header=None, skiprows=7, nrows=3))
        # Read only the data rows (from row 11 onwards)
        data_list.append(xls.parse(sheet_name, header=None, skiprows=10))
    
    # Use the header from the first sheet as the reference
    header_ref = header_list[0]
    # Concatenate all data parts
    full_data = pd.concat(data_list, ignore_index=True)

    # 2. Map column index to desired name based on the reference header
    col_index_to_name_map = {}
    used_indices = set()
    for desired_name, keyword in desired_to_keyword_map.items():
        for i in range(header_ref.shape[1]): # Iterate through column indices
            if i in used_indices:
                continue
            # Combine the 3 header rows for a given column index into a searchable string
            header_cell_str = ' '.join(str(header_ref.iloc[row, i]) for row in range(3) if pd.notna(header_ref.iloc[row, i]))
            searchable_header = header_cell_str.replace(' ', '').replace('　', '')
            if keyword in searchable_header:
                col_index_to_name_map[i] = desired_name
                used_indices.add(i)
                break

    # 3. Create the final DataFrame by selecting and renaming columns from the raw data
    final_df = pd.DataFrame()
    for col_index, new_name in col_index_to_name_map.items():
        if col_index < full_data.shape[1]: # Ensure the column exists in the data
            final_df[new_name] = full_data.iloc[:, col_index]

    # 4. Clean rows where '個人番号' is empty
    if '個人番号' in final_df.columns:
        final_df.dropna(subset=['個人番号'], inplace=True)
        final_df = final_df[final_df['個人番号'].astype(str).str.strip().str.lower() != 'nan']
        final_df = final_df[final_df['個人番号'].astype(str).str.strip() != '']

    # 5. Ensure final columns are in the correct order
    final_df = final_df.reindex(columns=desired_columns_ordered)

    # 6. Write to Excel
    final_df.to_excel(output_file, index=False)
    print(f"Successfully merged {len(sheet_names)} sheets and wrote to {output_file}")

except Exception as e:
    print(f"An error occurred: {e}")
