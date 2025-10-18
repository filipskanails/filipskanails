export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const uah = url.searchParams.get("amount") || "1000";
    const title = url.searchParams.get("title") || "Доступ до курсу Next Level";
    const ref = url.searchParams.get("ref") || crypto.randomUUID();
    const thank = url.searchParams.get("thank") || "https://filipskanails.github.io/filipskanails/thankyou.html";
    const amountKop = Math.round(parseFloat(uah) * 100);

    const payload = {
      amount: amountKop,
      ccy: 980,
      merchantPaymInfo: {
        reference: ref,
        destination: title,
        comment: title,
        redirectUrl: thank
        // webHookUrl: "https://example.com/mono-webhook" // опц.
      },
      validity: 3600
    };

    try {
      const resp = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Token": env.MONO_TOKEN },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) return new Response(`Mono API error ${resp.status}: ${await resp.text()}`, { status: 500 });
      const data = await resp.json();
      if (!data.pageUrl) return new Response(`Unexpected response: ${JSON.stringify(data)}`, { status: 500 });
      return Response.redirect(data.pageUrl, 302);
    } catch (e) {
      return new Response(`Worker error: ${e.message}`, { status: 500 });
    }
  }
};
