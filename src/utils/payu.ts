import type { PayuCheckout } from "../types/api";

/** Auto-submit HTML form POST to PayU hosted checkout. */
export function redirectToPayuCheckout(payu: PayuCheckout) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payu.action;
  form.style.display = "none";

  const fields: Record<string, string> = {
    key: payu.key,
    txnid: payu.txnid,
    amount: payu.amount,
    productinfo: payu.productinfo,
    firstname: payu.firstname,
    email: payu.email,
    phone: payu.phone,
    surl: payu.surl,
    furl: payu.furl,
    hash: payu.hash,
    udf1: payu.udf1,
    udf2: payu.udf2,
    udf3: payu.udf3,
    udf4: payu.udf4,
    udf5: payu.udf5,
    service_provider: payu.service_provider,
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
