type Props = {
  message?: string;
  colSpan?: number;
};

/**
 * テーブルの空状態表示コンポーネント
 */
export function DataTableEmpty({ message = "データがありません", colSpan }: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-24 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
