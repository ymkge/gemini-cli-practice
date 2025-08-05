import pandas as pd
import os
from typing import List, Dict, Tuple

# --- Configuration ---
INPUT_FILE = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/input/AIデータ.xlsx')
OUTPUT_FILE = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/output/merged_data.xlsx')

# Maps the final desired column name to the keyword to find in the messy header.
DESIRED_TO_KEYWORD_MAP = {
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


def load_and_combine_sheets(file_path: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Loads an Excel file, separating header and data from all sheets."""
    xls = pd.ExcelFile(file_path)
    sheet_names = xls.sheet_names

    header_list = [xls.parse(sheet_name, header=None, skiprows=7, nrows=3) for sheet_name in sheet_names]
    data_list = [xls.parse(sheet_name, header=None, skiprows=10) for sheet_name in sheet_names]

    header_ref = header_list[0]
    full_data = pd.concat(data_list, ignore_index=True)
    return header_ref, full_data

def map_columns(header_ref: pd.DataFrame, keyword_map: Dict[str, str]) -> Dict[int, str]:
    """Maps column indices to desired names based on keywords in the header."""
    col_index_to_name_map = {}
    used_indices = set()
    for desired_name, keyword in keyword_map.items():
        for i in range(header_ref.shape[1]):
            if i in used_indices:
                continue
            header_cell_str = ' '.join(str(header_ref.iloc[row, i]) for row in range(3) if pd.notna(header_ref.iloc[row, i]))
            searchable_header = header_cell_str.replace(' ', '').replace('　', '')
            if keyword in searchable_header:
                col_index_to_name_map[i] = desired_name
                used_indices.add(i)
                break
    return col_index_to_name_map

def process_data(full_data: pd.DataFrame, col_map: Dict[int, str], ordered_cols: List[str]) -> pd.DataFrame:
    """Selects, renames, and cleans the data."""
    final_df = pd.DataFrame()
    for col_index, new_name in col_map.items():
        if col_index < full_data.shape[1]:
            final_df[new_name] = full_data.iloc[:, col_index]

    if '個人番号' in final_df.columns:
        final_df.dropna(subset=['個人番号'], inplace=True)
        final_df = final_df[final_df['個人番号'].astype(str).str.strip().str.lower() != 'nan']
        final_df = final_df[final_df['個人番号'].astype(str).str.strip() != '']

    return final_df.reindex(columns=ordered_cols)

def main():
    """Main function to run the data processing pipeline."""
    try:
        print("Starting data processing...")
        header_ref, full_data = load_and_combine_sheets(INPUT_FILE)
        col_map = map_columns(header_ref, DESIRED_TO_KEYWORD_MAP)
        final_df = process_data(full_data, col_map, list(DESIRED_TO_KEYWORD_MAP.keys()))
        
        final_df.to_excel(OUTPUT_FILE, index=False)
        print(f"Successfully processed and saved data to {OUTPUT_FILE}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()