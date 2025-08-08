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


def find_header_start_row(xls: pd.ExcelFile, sheet_name: str, max_rows_to_search: int = 20) -> int:
    """
    Finds the starting row of the header by searching for a cell that contains
    both '氏' and '名' characters, accommodating for variable spacing between them.
    """
    try:
        # Read a sample of the sheet to locate the header
        df_sample = xls.parse(sheet_name, header=None, nrows=max_rows_to_search)
        for i, row in df_sample.iterrows():
            # Check each cell in the row
            for cell_value in row:
                if isinstance(cell_value, str) and '氏' in cell_value and '名' in cell_value:
                    return i  # Return the 0-indexed row number where the cell was found
    except Exception as e:
        print(f"  [Warning] Could not read sheet '{sheet_name}' to find header. Error: {e}")
        return -1
    return -1  # Return -1 if a suitable cell is not found


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
            # Combine the 3 header rows for a given column into a single string for searching
            header_cell_str = ' '.join(str(header_ref.iloc[row, i]) for row in range(header_ref.shape[0]) if pd.notna(header_ref.iloc[row, i]))
            searchable_header = header_cell_str.replace(' ', '').replace('　', '')

            # Special handling for '氏名' to accommodate variable spacing
            if desired_name == '氏名':
                if '氏' in searchable_header and '名' in searchable_header:
                    col_index_to_name_map[i] = desired_name
                    used_indices.add(i)
                    break
            # Standard handling for all other keywords
            else:
                if keyword in searchable_header:
                    col_index_to_name_map[i] = desired_name
                    used_indices.add(i)
                    break
    return col_index_to_name_map

def main():
    """Main function to run the data processing pipeline."""
    try:
        print("Starting data processing...")
        if not os.path.exists(INPUT_FILE):
            print(f"Error: Input file not found at {INPUT_FILE}")
            return

        xls = pd.ExcelFile(INPUT_FILE)
        sheet_names = xls.sheet_names

        all_sheets_data = []
        ordered_cols = list(DESIRED_TO_KEYWORD_MAP.keys())

        for sheet_name in sheet_names:
            print(f"Processing sheet: {sheet_name}")

            # Dynamically find the header start row by looking for a cell with '氏' and '名'
            header_start_row = find_header_start_row(xls, sheet_name)

            if header_start_row == -1:
                print(f"  [Warning] Header cell containing '氏' and '名' not found in the first 20 rows of sheet '{sheet_name}'. Skipping.")
                continue

            print(f"  [Info] Found header starting at row {header_start_row + 1}")

            # Read the 3-row header and the data table based on the dynamically found start row
            header_df = xls.parse(sheet_name, header=None, skiprows=header_start_row, nrows=3)
            data_df = xls.parse(sheet_name, header=None, skiprows=header_start_row + 3)

            col_map = map_columns(header_df, DESIRED_TO_KEYWORD_MAP)

            if not col_map:
                print(f"  [Warning] No columns could be mapped for sheet '{sheet_name}'. Skipping.")
                continue

            sheet_final_df = pd.DataFrame()
            for col_index, new_name in col_map.items():
                if col_index < data_df.shape[1]:
                    sheet_final_df[new_name] = data_df.iloc[:, col_index]
            
            all_sheets_data.append(sheet_final_df)

        if not all_sheets_data:
            print("No data could be processed from any sheets.")
            return
            
        # Combine all processed sheets, filling missing columns with NaN
        full_data = pd.concat(all_sheets_data, ignore_index=True)

        # Clean the combined data based on the original conditions.
        # A record is valid if it meets any of the following criteria:
        # 1. '出勤日数' is a number greater than 0.
        # 2. '役員報酬' is a number greater than 0.
        # 3. '備考' contains the string '産業医'.

        # Helper function to create a validity mask for a numeric series
        def is_valid_numeric(series):
            if series is None:
                return pd.Series([False] * len(full_data), index=full_data.index)
            # Attempt to convert to numeric, coercing errors to NaN, then check condition
            numeric_series = pd.to_numeric(series, errors='coerce')
            return numeric_series.notna() & (numeric_series > 0)

        # Helper function to create a validity mask for a text series
        def contains_text(series, text):
            if series is None:
                return pd.Series([False] * len(full_data), index=full_data.index)
            # Check for the presence of the text, handling potential NaN values
            return series.astype(str).str.contains(text, na=False)

        # Create masks for each condition
        attendance_valid = is_valid_numeric(full_data.get('出勤日数'))
        reward_valid = is_valid_numeric(full_data.get('役員報酬'))
        doctor_present = contains_text(full_data.get('備考'), '産業医')

        # Apply the final filter: a row is kept if any of the conditions are true
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
