/**
 * Admin Layout
 * Note: Admin access control is handled by middleware
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
