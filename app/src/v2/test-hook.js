// tests only (window.__PL_TEST set before load): a way to evaluate inside the shared closure, like today's page's __ev
if (window.__PL_TEST) window.__ev = c => eval(c);
