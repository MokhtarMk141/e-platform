export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
      {children}
    </div>
  );
}