const url = "https://college-event-platform-woad.vercel.app/api/admin/colleges/74ceff26-18a0-4a7b-afe9-35fd340e79cc";

fetch(url, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test",
    slug: "test",
    institution_type: "College",
    city: "Test",
    state: "Test",
    country: "India",
    logo_url: "",
    cover_url: "",
    status: "active",
    sort_order: 0
  })
}).then(res => res.json()).then(console.log).catch(console.error);
