/** @jsx h */
import Stripe from "https://esm.sh/stripe?target=deno";
import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import Handlebars from "https://dev.jspm.io/handlebars@4.7.6";

const stripe = Stripe("sk_test_51LWRSgJCDjxWO9cJNB4j8iMgZd68TzXoPJ48IMjuZMrYKBFzEu5vMr7hvzV1kOyTxoTfDsSclaus35ymQUSjbIL600K38H6PJP", {
  httpClient: Stripe.createFetchHttpClient(),
});
var session;

const handler = async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname == "/stripe") {
      const res = await req.json();
      const stripeID = res.data.object.id;
      session = await stripe.checkout.sessions.retrieve(stripeID);
      const body = {
        data: {
          amount: parseFloat((session.amount_total / 100).toFixed(2)),
          userID: session.metadata.userID,
          donor: session.customer_details.email,
          stripeID: stripeID,
        },
      }
      await fetch("https://donation-platform-back-end.herokuapp.com/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }
  }
  return new Response("200 OK", {
    headers: { "content-type": "text/plain" },
  });
}

serve(handler, { port: 8000 });