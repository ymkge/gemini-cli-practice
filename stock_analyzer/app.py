
import streamlit as st
import pandas as pd
import requests
from bs4 import BeautifulSoup
import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
import io
import time
import japanize_matplotlib

def get_market_cap_ranking(min_market_cap):
    """
    Yahoo!ファイナンスから時価総額ランキングを取得し、指定した時価総額以上の銘柄を抽出する
    """
    base_url = "https://finance.yahoo.co.jp/stocks/ranking/marketCapitalHigh?market=all&page={}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    }
    all_stocks_df = pd.DataFrame()

    for page in range(1, 11): # 最大10ページまで取得
        url = base_url.format(page)
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status() # HTTPエラーがあれば例外を発生させる
            
            # pd.read_htmlはリストを返すので、最初のテーブルを取得
            tables = pd.read_html(io.StringIO(response.text))
            
            if not tables:
                break # テーブルが見つからなければ終了
            
            df = tables[0] # 最初のテーブルがランキングデータと仮定
            
            # 必要な列の抽出と整形
            # '名称・コード・市場' 列からコード、名称、市場を抽出
            # 正規表現で「名称(株) コード 市場」のような形式を想定
            # 例: トヨタ自動車(株) 7203 東証PRM
            df[['銘柄名', '証券コード', '市場']] = df['名称・コード・市場'].str.extract(r'(.+?)\s*(\d{4})\s*(.+)')
            
            # 時価総額の列名を修正し、数値に変換
            df = df.rename(columns={'時価総額(百万円)': '時価総額（百万円）'})
            df['時価総額（百万円）'] = df['時価総額（百万円）'].str.replace(',', '').str.replace('百万円', '').astype(int)
            
            # 時価総額（億円）を計算
            df['時価総額（億円）'] = df['時価総額（百万円）'] / 100
            
            # 必要な列のみを選択
            df = df[['証券コード', '銘柄名', '市場', '時価総額（億円）']]
            
            # 指定された時価総額以上の銘柄をフィルタリング
            df = df[df['時価総額（億円）'] >= min_market_cap]
            
            all_stocks_df = pd.concat([all_stocks_df, df], ignore_index=True)
            
            # 次のページに該当銘柄がなければループを抜ける
            if df.empty and page > 1: # 2ページ目以降で該当銘柄がなければ、それ以上探す必要はない
                break

            time.sleep(0.5) # サーバーへの負荷軽減

        except Exception as e:
            st.warning(f"ページ {page} の取得中にエラーが発生しました: {e}")
            break

    return all_stocks_df

def calculate_rci(series, period):
    """
    RCIを計算する
    """
    rank_price = series.rank(ascending=False)
    rank_date = pd.Series(np.arange(len(series)) + 1, index=series.index)
    d = (rank_price - rank_date).pow(2).sum()
    n = len(series)
    rci = (1 - (6 * d) / (n * (n**2 - 1))) * 100
    return rci

def calculate_fibonacci(series):
    """
    フィボナッチリトレースメントの23.6%ラインを計算し、現在の株価がそれを下回っているか判定する
    """
    max_price = series.max()
    min_price = series.min()
    fib_23_6 = max_price - (max_price - min_price) * 0.236
    current_price = series.iloc[-1]
    return "下回っている" if current_price < fib_23_6 else "下回っていない"

def get_technical_data(df):
    """
    各銘柄のテクニカル指標（RCI、フィボナッチ）を計算する
    """
    technical_data = []
    for code in df["証券コード"]:
        try:
            ticker = yf.Ticker(f"{code}.T")
            hist = ticker.history(period="10y")["Close"]

            if len(hist) < 252: # 1年未満のデータしかない場合はスキップ
                continue

            rci_1y = calculate_rci(hist.tail(252), 252)
            rci_5y = calculate_rci(hist.tail(252*5), 252*5) if len(hist) >= 252*5 else None
            rci_10y = calculate_rci(hist, len(hist)) if len(hist) >= 252*5 else None

            fib_1y = calculate_fibonacci(hist.tail(252))
            fib_5y = calculate_fibonacci(hist.tail(252*5)) if len(hist) >= 252*5 else None
            fib_10y = calculate_fibonacci(hist) if len(hist) >= 252*5 else None

            # PER, PBR, 配当利回り取得
            info = ticker.info
            per = info.get('trailingPE')
            pbr = info.get('priceToBook')
            dividend_yield = info.get('dividendYield') if info.get('dividendYield') is not None else None
            
            technical_data.append([code, rci_1y, rci_5y, rci_10y, fib_1y, fib_5y, fib_10y, per, pbr, dividend_yield])

        except Exception as e:
            # st.warning(f"{code}のデータ取得または計算中にエラーが発生しました: {e}")
            continue
            
    tech_df = pd.DataFrame(technical_data, columns=["証券コード", "RCI(1年)", "RCI(5年)", "RCI(10年)", "フィボナッチ23.6%(1年)", "フィボナッチ23.6%(5年)", "フィボナッチ23.6%(10年)", "PER", "PBR", "配当利回り(%)"])
    return pd.merge(df, tech_df, on="証券コード")

def main():
    """
    メインの処理
    """
    st.title("日本株分析ツール")

    # サイドバー
    st.sidebar.header("設定")
    min_market_cap = st.sidebar.number_input("時価総額（億円）以上", min_value=0, value=1000)

    # メインコンテンツ
    st.header("分析結果")

    if st.button("データ取得＆分析実行"):
        with st.spinner("データを取得・分析中..."):
            # 1. 時価総額ランキング取得
            stock_list_df = get_market_cap_ranking(min_market_cap)
            
            if stock_list_df.empty:
                st.warning("該当する銘柄が見つかりませんでした。")
                return

            # 2. テクニカル指標の計算
            result_df = get_technical_data(stock_list_df)
            
            if result_df.empty:
                st.warning("テクニカル指標を計算できる銘柄がありませんでした。")
                return

            # 3. RCI(1年)でソート
            result_df = result_df.sort_values(by="RCI(1年)").reset_index(drop=True)
            st.session_state.result_df = result_df

    if "result_df" in st.session_state and not st.session_state.result_df.empty:
        result_df = st.session_state.result_df
        st.dataframe(result_df)

        # RCIヒストグラム
        st.subheader("RCI(1年) ヒストグラム")
        fig, ax = plt.subplots()
        ax.hist(result_df["RCI(1年)"].dropna(), bins=np.arange(-100, 110, 10))
        plt.xlabel("RCI(1年)")
        plt.ylabel("銘柄数")
        st.pyplot(fig)

        # CSVダウンロード
        st.download_button(
            label="CSV形式でダウンロード",
            data=result_df.to_csv(index=False).encode('utf-8-sig'),
            file_name='stock_analysis_result.csv',
            mime='text/csv',
        )

if __name__ == "__main__":
    main()
