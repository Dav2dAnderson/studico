import ActivationClient from "./ActivationClient";

type ActivatePageParams = {
  uidb64: string;
  token: string;
};

export default async function ActivatePage({
  params,
}: {
  params: Promise<ActivatePageParams>;
}) {
  const { uidb64, token } = await params;

  return <ActivationClient uidb64={uidb64} token={token} />;
}
