const SECTIONS = [
  {
    title: 'サービスの概要',
    items: [
      '本サービスはチーム開発向けのプランニングポーカーツールです。',
      'アカウント登録不要で利用できます。',
    ],
  },
  {
    title: 'データの取り扱い',
    items: [
      'ユーザー名・投票データは一時的に保存され、一定時間後に自動削除されます。',
      '個人情報の永続的な保存は行いません。',
      'Cookieやトラッキングは使用しません。',
    ],
  },
  {
    title: '免責事項',
    items: [
      'サービスは「現状のまま」提供されます。',
      'サービスの中断・終了・変更を予告なく行う場合があります。',
      'サービス利用により生じた損害について責任を負いません。',
    ],
  },
  {
    title: '禁止事項',
    items: [
      'サービスへの不正アクセスや過度な負荷をかける行為。',
      '他のユーザーの利用を妨げる行為。',
    ],
  },
  {
    title: '規約の変更',
    items: [
      '利用規約は予告なく変更される場合があります。',
    ],
  },
] as const;

function TermsSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function TermsView() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">利用規約</h1>
      {SECTIONS.map((section) => (
        <TermsSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}
    </div>
  );
}
