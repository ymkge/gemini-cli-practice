
import streamlit as st
import pandas as pd

# --- データ定義 ---
questions_data = [
    # A: 仕事のストレス要因 (17問)
    {"id": "A1", "text": "A1. 非常にたくさんの仕事をしなければならない", "category": "A", "reverse": False},
    {"id": "A2", "text": "A2. 時間内に仕事が処理しきれない", "category": "A", "reverse": False},
    {"id": "A3", "text": "A3. 一生懸命働かなければならない", "category": "A", "reverse": False},
    {"id": "A4", "text": "A4. かなり注意を集中する必要がある", "category": "A", "reverse": False},
    {"id": "A5", "text": "A5. 高度の知識や技術が必要なむずかしい仕事だ", "category": "A", "reverse": False},
    {"id": "A6", "text": "A6. 勤務時間中はいつも仕事のことを考えていなければならない", "category": "A", "reverse": False},
    {"id": "A7", "text": "A7. からだを大変よく使う仕事だ", "category": "A", "reverse": False},
    {"id": "A8", "text": "A8. 自分のペースで仕事ができる", "category": "A", "reverse": True},
    {"id": "A9", "text": "A9. 自分で仕事の順番・やり方を決めることができる", "category": "A", "reverse": True},
    {"id": "A10", "text": "A10. 職場の仕事の方針に自分の意見を反映できる", "category": "A", "reverse": True},
    {"id": "A11", "text": "A11. 自分の技能や知識を仕事で使うことが少ない", "category": "A", "reverse": False},
    {"id": "A12", "text": "A12. 私の部署内で意見のくい違いがある", "category": "A", "reverse": False},
    {"id": "A13", "text": "A13. 私の部署と他の部署とはうまが合わない", "category": "A", "reverse": False},
    {"id": "A14", "text": "A14. 私の職場の雰囲気は友好的である", "category": "A", "reverse": True},
    {"id": "A15", "text": "A15. 私の職場の作業環境（騒音、照明、温度、換気など）はよくない", "category": "A", "reverse": False},
    {"id": "A16", "text": "A16. 仕事の内容は自分にあっている", "category": "A", "reverse": True},
    {"id": "A17", "text": "A17. 働きがいのある仕事だ", "category": "A", "reverse": True},

    # B: 心身のストレス反応 (29問)
    {"id": "B1", "text": "B1. 活気がわいてくる", "category": "B", "reverse": True},
    {"id": "B2", "text": "B2. 元気がいっぱいだ", "category": "B", "reverse": True},
    {"id": "B3", "text": "B3. 生き生きする", "category": "B", "reverse": True},
    {"id": "B4", "text": "B4. 怒りを感じる", "category": "B", "reverse": False},
    {"id": "B5", "text": "B5. 内心腹立たしい", "category": "B", "reverse": False},
    {"id": "B6", "text": "B6. イライラしている", "category": "B", "reverse": False},
    {"id": "B7", "text": "B7. ひどく疲れた", "category": "B", "reverse": False},
    {"id": "B8", "text": "B8. へとへとだ", "category": "B", "reverse": False},
    {"id": "B9", "text": "B9. だるい", "category": "B", "reverse": False},
    {"id": "B10", "text": "B10. 気がはりつめている", "category": "B", "reverse": False},
    {"id": "B11", "text": "B11. 不安だ", "category": "B", "reverse": False},
    {"id": "B12", "text": "B12. 落着かない", "category": "B", "reverse": False},
    {"id": "B13", "text": "B13. ゆううつだ", "category": "B", "reverse": False},
    {"id": "B14", "text": "B14. 何をするのも面倒だ", "category": "B", "reverse": False},
    {"id": "B15", "text": "B15. 物事に集中できない", "category": "B", "reverse": False},
    {"id": "B16", "text": "B16. 気が晴れない", "category": "B", "reverse": False},
    {"id": "B17", "text": "B17. 仕事が手につかない", "category": "B", "reverse": False},
    {"id": "B18", "text": "B18. 悲しいと感じる", "category": "B", "reverse": False},
    {"id": "B19", "text": "B19. めまいがする", "category": "B", "reverse": False},
    {"id": "B20", "text": "B20. 体のふしぶしが痛む", "category": "B", "reverse": False},
    {"id": "B21", "text": "B21. 頭が重かったり頭痛がする", "category": "B", "reverse": False},
    {"id": "B22", "text": "B22. 首筋や肩がこる", "category": "B", "reverse": False},
    {"id": "B23", "text": "B23. 腰が痛い", "category": "B", "reverse": False},
    {"id": "B24", "text": "B24. 目が疲れる", "category": "B", "reverse": False},
    {"id": "B25", "text": "B25. 動悸や息切れがする", "category": "B", "reverse": False},
    {"id": "B26", "text": "B26. 胃腸の具合が悪い", "category": "B", "reverse": False},
    {"id": "B27", "text": "B27. 食欲がない", "category": "B", "reverse": False},
    {"id": "B28", "text": "B28. 便秘や下痢をする", "category": "B", "reverse": False},
    {"id": "B29", "text": "B29. よく眠れない", "category": "B", "reverse": False},

    # C: 周囲のサポート (9問)
    {"id": "C1", "text": "C1. 上司にどのくらい気軽に話ができますか", "category": "C", "reverse": True},
    {"id": "C2", "text": "C2. 職場の同僚にどのくらい気軽に話ができますか", "category": "C", "reverse": True},
    {"id": "C3", "text": "C3. 配偶者、家族、友人にどのくらい気軽に話ができますか", "category": "C", "reverse": True},
    {"id": "C4", "text": "C4. 困った時、上司はどのくらい頼りになりますか", "category": "C", "reverse": True},
    {"id": "C5", "text": "C5. 困った時、職場の同僚はどのくらい頼りになりますか", "category": "C", "reverse": True},
    {"id": "C6", "text": "C6. 困った時、配偶者、家族、友人はどのくらい頼りになりますか", "category": "C", "reverse": True},
    {"id": "C7", "text": "C7. 個人的な問題を相談したら、上司はどのくらいきいてくれますか", "category": "C", "reverse": True},
    {"id": "C8", "text": "C8. 個人的な問題を相談したら、職場の同僚はどのくらいきいてくれますか", "category": "C", "reverse": True},
    {"id": "C9", "text": "C9. 個人的な問題を相談したら、配偶者、家族、友人はどのくらいきいてくれますか", "category": "C", "reverse": True},

    # D: 満足度 (2問)
    {"id": "D1", "text": "D1. 仕事に満足だ", "category": "D", "reverse": True},
    {"id": "D2", "text": "D2. 家庭生活に満足だ", "category": "D", "reverse": True},
]

# 評価尺度
scales = {
    "量的負担": ["A1", "A2", "A3"],
    "質的負担": ["A4", "A5", "A6", "A7"],
    "裁量権": ["A8", "A9", "A10"],
    "仕事の適性": ["A11", "A16"],
    "職場人間関係": ["A12", "A13", "A14"],
    "職場環境": ["A15"],
    "働きがい": ["A17"],
    "活気": ["B1", "B2", "B3"],
    "イライラ感": ["B4", "B5", "B6"],
    "疲労感": ["B7", "B8", "B9"],
    "不安感": ["B10", "B11", "B12"],
    "抑うつ感": ["B13", "B14", "B15", "B16", "B17", "B18"],
    "身体愁訴": ["B19", "B20", "B21", "B22", "B23", "B24", "B25", "B26", "B27", "B28", "B29"],
    "上司のサポート": ["C1", "C4", "C7"],
    "同僚のサポート": ["C2", "C5", "C8"],
    "家族・友人のサポート": ["C3", "C6", "C9"],
    "仕事満足度": ["D1"],
    "家庭満足度": ["D2"],
}

# --- アプリケーション ---
st.title("職業性ストレス簡易調査票（57項目版）")
st.write("ご自身のストレス状態をチェックしてみましょう。各質問について、最も当てはまるものを1つ選んでください。")
st.info("注意：このツールはあくまでプロトタイプであり、医学的診断に代わるものではありません。")

# 回答の選択肢
options = ["そうだ", "まあそうだ", "ややちがう", "ちがう"]
score_map = {
    "そうだ": 4,
    "まあそうだ": 3,
    "ややちがう": 2,
    "ちがう": 1
}
score_map_reverse = {
    "そうだ": 1,
    "まあそうだ": 2,
    "ややちがう": 3,
    "ちがう": 4
}

# ユーザーの回答を保存する辞書
if 'answers' not in st.session_state:
    st.session_state.answers = {}

# 質問の表示
for q in questions_data:
    st.session_state.answers[q["id"]] = st.radio(
        label=q["text"],
        options=options,
        key=q["id"],
        horizontal=True
    )

# 診断ボタン
if st.button("診断結果を見る"):
    # 全ての質問に回答したかチェック
    if len(st.session_state.answers) != 57:
        st.error("すべての質問に回答してください。")
    else:
        # --- 点数計算 ---
        scores = {}
        for q in questions_data:
            answer = st.session_state.answers[q["id"]]
            if q["reverse"]:
                scores[q["id"]] = score_map_reverse[answer]
            else:
                scores[q["id"]] = score_map[answer]

        # --- 尺度ごとの合計点 ---
        scale_scores = {}
        for scale_name, question_ids in scales.items():
            scale_scores[scale_name] = sum(scores[qid] for qid in question_ids)

        # --- 結果表示 ---
        st.header("診断結果")
        st.write("各尺度の点数（点数が高いほどストレスが高い傾向にあります）")

        # 結果をデータフレームに変換して表示
        df_scores = pd.DataFrame(list(scale_scores.items()), columns=["尺度", "合計点"])
        st.dataframe(df_scores.set_index("尺度"))

        # ストレス要因、ストレス反応、サポートの3つの主要なカテゴリの合計点を計算
        total_stressor_score = sum(scale_scores[s] for s in ["量的負担", "質的負担", "裁量権", "仕事の適性", "職場人間関係", "職場環境"])
        total_reaction_score = sum(scale_scores[s] for s in ["活気", "イライラ感", "疲労感", "不安感", "抑うつ感", "身体愁訴"])
        total_support_score = sum(scale_scores[s] for s in ["上司のサポート", "同僚のサポート", "家族・友人のサポート"])

        st.subheader("総合的なストレスレベルの評価")

        # 判定ロジック（厚労省のマニュアルを参考に簡略化）
        # 1. 心身のストレス反応の合計点が高い
        # 2. ストレス要因とサポートの点数が著しく高い
        is_high_stress = False
        if total_reaction_score >= 77: # 高ストレスの基準例（素点換算ではないためあくまで目安）
            is_high_stress = True
            st.warning("高ストレス状態にある可能性が高いです。")
            st.write("心身のストレス反応の合計点数が高いレベルにあります。")

        if total_stressor_score >= 76 and total_support_score >= 36: # 高ストレスの基準例（素点換算ではないためあくまで目安）
            if not is_high_stress:
                st.warning("高ストレス状態にある可能性が高いです。")
            is_high_stress = True
            st.write("仕事のストレス要因と、周囲のサポートの状況から、高いストレス状態にある可能性が考えられます。")

        if not is_high_stress:
            st.success("現在のところ、総合的なストレスレベルは標準の範囲内と考えられます。")

        st.info("この結果は、あくまで入力に基づく簡易的な評価です。気になる点があれば、専門家（医師、カウンセラーなど）にご相談ください。")

        # グラフ表示
        st.subheader("ストレス要因のバランス")
        stressor_scores = {s: scale_scores[s] for s in ["量的負担", "質的負担", "裁量権", "仕事の適性", "職場人間関係", "職場環境", "働きがい"]}
        df_stressor = pd.DataFrame(list(stressor_scores.items()), columns=['尺度', '点数'])
        max_stressor_score = df_stressor['点数'].max()
        df_stressor_padded = pd.concat([df_stressor, pd.DataFrame([{'尺度': 'ダミー', '点数': max_stressor_score * 1.1}])], ignore_index=True)
        st.bar_chart(df_stressor_padded.set_index('尺度'))

        st.subheader("心身のストレス反応")
        reaction_scores = {s: scale_scores[s] for s in ["活気", "イライラ感", "疲労感", "不安感", "抑うつ感", "身体愁訴"]}
        df_reaction = pd.DataFrame(list(reaction_scores.items()), columns=['尺度', '点数'])
        max_reaction_score = df_reaction['点数'].max()
        df_reaction_padded = pd.concat([df_reaction, pd.DataFrame([{'尺度': 'ダミー', '点数': max_reaction_score * 1.1}])], ignore_index=True)
        st.bar_chart(df_reaction_padded.set_index('尺度'))

        st.subheader("周囲からのサポート")
        support_scores = {s: scale_scores[s] for s in ["上司のサポート", "同僚のサポート", "家族・友人のサポート"]}
        df_support = pd.DataFrame(list(support_scores.items()), columns=['尺度', '点数'])
        max_support_score = df_support['点数'].max()
        df_support_padded = pd.concat([df_support, pd.DataFrame([{'尺度': 'ダミー', '点数': max_support_score * 1.1}])], ignore_index=True)
        st.bar_chart(df_support_padded.set_index('尺度'))
