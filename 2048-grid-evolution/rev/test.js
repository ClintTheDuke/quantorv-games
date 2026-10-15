const projectKey = 'sb_publishable_g17RMOUGD14_QnxuIbC6NA_Yz3NwOMF';
const projectUrl = 'https://gerrwnwfllynvaahgxur.supabase.co';

window.supaDb = window.supabase.createClient(projectUrl, projectKey);

document.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await window.supaDb
    .from("Profiles")
    .select("email");

  console.log({ data, error });

  const redirectParams = new URLSearchParams(window.location.search);
  console.log(window.location.search);
});