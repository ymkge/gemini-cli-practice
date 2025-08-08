import pandas as pd
import os
from typing import List, Dict, Tuple

# --- Configuration ---
INPUT_FILE = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/input/AIデータ.xlsx')
OUTPUT_FILE = os.path.expanduser('~/Documents/git/gemini-cli-practice/sheets_to_sheet/output/merged_data.xlsx')

# Maps the final desired column name to the keyword to find in the messy header.
# The order of this dictionary determines the final column order in the output file.
DESIRED_TO_KEYWORD_MAP = {
    '氏名': '氏名',
    '部署': '課',
    '個人番号': '個人',
    '役員報酬': '役員報酬',
    '基本給': '基本給',
    '基本給②': '基本給②',
    '役付': '役付',
    '住宅': '住宅',
    '資格': '資格',
    '業務手当': '業務',
    '家族': '家族',
    '通勤': '通勤',
    '営業手当': '営業手当',
    '夜勤': '夜勤',
    '欠勤': '欠勤',
    '出勤日数': '出勤',
    '互助会': '互助会',
    '財形': '財形',
    '旅行２': '旅行２',
    '前払退職金①': '前払退職金①',
    '前払退職金②': '前払退職金②',
    'その他': 'その他',
    '保険料': '保険料',
    '地代': '地代',
    '備考': '備考'
}


def map_columns(header_ref: pd.DataFrame, keyword_map: Dict[str, str]) -> Dict[int, str]:
    """Maps column indices to desired names based on keywords in the header."""
    col_index_to_name_map = {}
    used_indices = set()
    # Sort by keyword length (desc) to match more specific names first (e.g., "基本給②" before "基本給")
    sorted_keyword_map = sorted(keyword_map.items(), key=lambda item: len(str(item[1])), reverse=True)
    for desired_name, keyword in sorted_keyword_map:
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

def main():
    """Main function to run the data processing pipeline."""
    try:
        print("Starting data processing...")
        xls = pd.ExcelFile(INPUT_FILE)
        sheet_names = xls.sheet_names

        all_sheets_data = []
        ordered_cols = list(DESIRED_TO_KEYWORD_MAP.keys())

        for sheet_name in sheet_names:
            print(f"Processing sheet: {sheet_name}")
            header_df = xls.parse(sheet_name, header=None, skiprows=7, nrows=3)
            data_df = xls.parse(sheet_name, header=None, skiprows=10)

            col_map = map_columns(header_df, DESIRED_TO_KEYWORD_MAP)

            sheet_final_df = pd.DataFrame()
            for col_index, new_name in col_map.items():
                if col_index < data_df.shape[1]:
                    sheet_final_df[new_name] = data_df.iloc[:, col_index]
            
            all_sheets_data.append(sheet_final_df)

        if not all_sheets_data:
            print("No data found in any sheets.")
            return
            
        # Combine all processed sheets, filling missing columns with NaN
        full_data = pd.concat(all_sheets_data, ignore_index=True)

        # Clean the combined data based on the new conditions.
        # A record is valid if it has:
        # - a valid '出勤日数' OR
        # - a valid '役員報酬' OR
        # - '産業医' in the '備考' column

        # Helper function to create a validity mask for a series
        def is_valid(series):
            if series is None:
                return pd.Series([False] * len(full_data), index=full_data.index)
            # Attempt to convert to numeric, coercing errors to NaN
            numeric_series = pd.to_numeric(series, errors='coerce')
            return numeric_series.notna() & (numeric_series != 0)

        # Create masks for each condition
        attendance_valid = is_valid(full_data.get('出勤日数'))
        reward_valid = is_valid(full_data.get('役員報酬'))
        doctor_present = full_data.get('備考', pd.Series([], dtype=str)).str.contains('産業医', na=False)

        # Apply the final filter
        full_data = full_data[attendance_valid | reward_valid | doctor_present]

        # Reorder columns to the desired final order
        final_df = full_data.reindex(columns=ordered_cols)

        final_df.to_excel(OUTPUT_FILE, index=False)
        print(f"Successfully processed and saved data to {OUTPUT_FILE}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {INPUT_FILE}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
