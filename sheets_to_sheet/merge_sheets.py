import pandas as pd
import os
import re
import sys
from typing import List, Dict, Tuple, Optional
from pandas import DataFrame, ExcelFile

# --- Dynamic Path Configuration ---
# Determine the base path, whether running as a script or a frozen .exe
if getattr(sys, 'frozen', False):
    # If the application is run as a bundle/frozen format (e.g., by PyInstaller)
    BASE_PATH = os.path.dirname(sys.executable)
else:
    # If run as a normal .py script
    BASE_PATH = os.path.dirname(os.path.abspath(__file__))

# --- Constants & Configuration ---
INPUT_FILE = os.path.join(BASE_PATH, 'input', 'AIデータ.xlsx')
OUTPUT_FILE = os.path.join(BASE_PATH, 'output', 'merged_data.xlsx')

DESIRED_TO_KEYWORD_MAP = {
    '氏名': '氏名', '部署': '課', '個人番号': '個人', '役員報酬': '役員報酬', '基本給': '基本給',
    '基本給②': '基本給②', '役付': '役付', '住宅': '住宅', '資格': '資格', '業務手当': '業務',
    '家族': '家族', '通勤': '通勤', '営業手当': '営業手当', '夜勤': '夜勤', '欠勤': '欠勤',
    '出勤日数': '出勤', '互助会': '互助会', '財形': '財形', '旅行２': '旅行２',
    '前払退職金①': '前払退職金①', '前払退職金②': '前払退職金②', 'その他': 'その他',
    '保険料': '保険料', '地代': '地代', '備考': '備考'
}

# --- Data Loading and Parsing Functions ---

def find_header_start_row(xls: ExcelFile, sheet_name: str, max_rows_to_search: int = 20) -> int:
    """
    Finds the starting row of the header by searching for a cell that contains
    both '氏' and '名' characters.
    """
    try:
        df_sample = xls.parse(sheet_name, header=None, nrows=max_rows_to_search)
        for i, row in df_sample.iterrows():
            for cell_value in row:
                if isinstance(cell_value, str) and '氏' in cell_value and '名' in cell_value:
                    return i
    except Exception as e:
        print(f"  [Warning] Could not read sheet '{sheet_name}' to find header. Error: {e}")
    return -1

def map_columns(header_ref: DataFrame, keyword_map: Dict[str, str]) -> Dict[int, str]:
    """Maps column indices to desired names based on keywords in the header."""
    col_index_to_name_map = {}
    used_indices = set()
    processing_order = [
        '基本給②', '前払退職金①', '前払退職金②', '役員報酬', '基本給', '氏名', '部署', '個人番号',
        '役付', '住宅', '資格', '業務手当', '家族', '通勤', '営業手当', '夜勤', '欠勤',
        '出勤日数', '互助会', '財形', '旅行２', 'その他', '保険料', '地代', '備考'
    ]
    processing_list = [(name, keyword_map[name]) for name in processing_order if name in keyword_map]

    for desired_name, keyword in processing_list:
        for i in range(header_ref.shape[1]):
            if i in used_indices:
                continue
            header_cell_str = ' '.join(str(header_ref.iloc[row, i]) for row in range(header_ref.shape[0]) if pd.notna(header_ref.iloc[row, i]))
            searchable_header = header_cell_str.replace(' ', '').replace('　', '')
            if not searchable_header:
                continue

            if desired_name == '氏名':
                if '氏' in searchable_header and '名' in searchable_header:
                    col_index_to_name_map[i] = desired_name
                    used_indices.add(i)
                    break
            elif desired_name == '基本給②':
                if '基本給②' in searchable_header or '基本給2' in searchable_header:
                    col_index_to_name_map[i] = desired_name
                    used_indices.add(i)
                    break
            else:
                if keyword in searchable_header:
                    col_index_to_name_map[i] = desired_name
                    used_indices.add(i)
                    break
    return col_index_to_name_map

def load_and_process_sheets(xls: ExcelFile, keyword_map: Dict[str, str]) -> Optional[DataFrame]:
    """Loads data from all sheets, maps columns, and concatenates them."""
    all_sheets_data = []
    for sheet_name in xls.sheet_names:
        print(f"Processing sheet: {sheet_name}")
        header_start_row = find_header_start_row(xls, sheet_name)
        if header_start_row == -1:
            print(f"  [Warning] Header not found in sheet '{sheet_name}'. Skipping.")
            continue

        print(f"  [Info] Found header starting at row {header_start_row + 1}")
        header_df = xls.parse(sheet_name, header=None, skiprows=header_start_row, nrows=3)
        data_df = xls.parse(sheet_name, header=None, skiprows=header_start_row + 3)
        col_map = map_columns(header_df, keyword_map)

        if not col_map:
            print(f"  [Warning] No columns could be mapped for sheet '{sheet_name}'. Skipping.")
            continue

        sheet_final_df = pd.DataFrame()
        for col_index, new_name in col_map.items():
            if col_index < data_df.shape[1]:
                sheet_final_df[new_name] = data_df.iloc[:, col_index]
        all_sheets_data.append(sheet_final_df)

    if not all_sheets_data:
        return None
    return pd.concat(all_sheets_data, ignore_index=True)

# --- Data Transformation Functions ---

def _extract_daily_rate(text: str) -> Optional[float]:
    """Extracts number from strings like '日額＠12,000円' or '1日＠1,000円'."""
    if not isinstance(text, str):
        return None
    text_normalized = text.replace('＠', '@').replace(',', '')
    match = re.search(r'@(\d+)', text_normalized)
    if match:
        return pd.to_numeric(match.group(1), errors='coerce')
    return None

def apply_special_calculations(df: DataFrame) -> DataFrame:
    """Applies special calculations for daily rate employees."""
    df_copy = df.copy()
    for index, row in df_copy.iterrows():
        yakutsuki_val = row.get('役付')
        if isinstance(yakutsuki_val, str) and '日額' in yakutsuki_val:
            yakutsuki_rate = _extract_daily_rate(yakutsuki_val)
            tsukin_rate = _extract_daily_rate(row.get('通勤'))
            shukkin_days = pd.to_numeric(row.get('出勤日数'), errors='coerce')

            if pd.notna(yakutsuki_rate) and pd.notna(shukkin_days):
                df_copy.loc[index, '基本給'] = yakutsuki_rate * shukkin_days
            if pd.notna(tsukin_rate) and pd.notna(shukkin_days):
                df_copy.loc[index, '通勤'] = tsukin_rate * shukkin_days

            original_tsukin_val = row.get('通勤')
            original_remark = row.get('備考')
            new_remark_part = yakutsuki_val
            if isinstance(original_tsukin_val, str) and pd.notna(original_tsukin_val):
                new_remark_part += f"/ 通勤{original_tsukin_val}"
            
            if isinstance(original_remark, str) and pd.notna(original_remark):
                df_copy.loc[index, '備考'] = f"{original_remark} {new_remark_part}"
            else:
                df_copy.loc[index, '備考'] = new_remark_part
            
            df_copy.loc[index, '役付'] = ' '
    return df_copy

def filter_valid_rows(df: DataFrame) -> DataFrame:
    """Filters the DataFrame to keep only valid rows based on business rules."""
    def is_valid_numeric(series):
        if series is None: return pd.Series([False] * len(df), index=df.index)
        numeric_series = pd.to_numeric(series, errors='coerce')
        return numeric_series.notna() & (numeric_series > 0)

    def contains_text(series, text):
        if series is None: return pd.Series([False] * len(df), index=df.index)
        return series.astype(str).str.contains(text, na=False)

    attendance_valid = is_valid_numeric(df.get('出勤日数'))
    reward_valid = is_valid_numeric(df.get('役員報酬'))
    doctor_present = contains_text(df.get('備考'), '産業医')
    
    return df[attendance_valid | reward_valid | doctor_present]

def add_total_row(df: DataFrame) -> DataFrame:
    """Adds a total row at the bottom of the DataFrame."""
    exclude_from_sum = ['氏名', '部署', '個人番号', '備考']
    cols_to_sum = [col for col in df.columns if col not in exclude_from_sum]
    
    df_for_sum = df.copy()
    if '欠勤' in df_for_sum.columns:
        df_for_sum['欠勤'] = df_for_sum['欠勤'].astype(str).str.replace('日', '', regex=False)
    
    sum_series = df_for_sum[cols_to_sum].apply(pd.to_numeric, errors='coerce').sum()
    sum_series['氏名'] = '合計'
    
    total_row_df = pd.DataFrame(sum_series).T
    return pd.concat([df, total_row_df], ignore_index=True)

# --- Main Execution ---

def main():
    """Main function to run the data processing pipeline."""
    try:
        print("Starting data processing...")
        if not os.path.exists(INPUT_FILE):
            print(f"Error: Input file not found at {INPUT_FILE}")
            return

        xls = pd.ExcelFile(INPUT_FILE)
        
        # Pipeline steps
        raw_data = load_and_process_sheets(xls, DESIRED_TO_KEYWORD_MAP)
        if raw_data is None:
            print("No data could be processed from any sheets.")
            return
            
        calculated_data = apply_special_calculations(raw_data)
        filtered_data = filter_valid_rows(calculated_data)
        
        ordered_df = filtered_data.reindex(columns=list(DESIRED_TO_KEYWORD_MAP.keys()))
        
        final_df = add_total_row(ordered_df)
        
        final_df.to_excel(OUTPUT_FILE, index=False)
        print(f"Successfully processed and saved data to {OUTPUT_FILE}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()