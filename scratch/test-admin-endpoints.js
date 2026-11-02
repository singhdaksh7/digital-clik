async function testAdmin() {
  const loginRes = await fetch("http://127.0.0.1:5100/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@digitalclik.com", password: "AdminClik2026!Secure" })
  }).then(r => r.json());

  const token = loginRes.data?.accessToken;
  console.log("Admin token acquired:", !!token);

  const health = await fetch("http://127.0.0.1:5100/api/admin/system-health", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("System Health:", JSON.stringify(health.data, null, 2));

  const seo = await fetch("http://127.0.0.1:5100/api/admin/seo/overview", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("SEO Overview (Indexable / Issues):", {
    totalIndexable: seo.data?.totalIndexable,
    totalIssues: seo.data?.totalIssues,
    highSeverityIssues: seo.data?.highSeverityIssues,
    redirectsCount: seo.data?.redirectsCount,
    open404s: seo.data?.open404s
  });

  const authors = await fetch("http://127.0.0.1:5100/api/admin/authors", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("Authors count:", authors.data?.length);

  const webhooks = await fetch("http://127.0.0.1:5100/api/admin/webhooks", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("Webhooks endpoint status:", webhooks.success);
}

testAdmin().catch(console.error);
