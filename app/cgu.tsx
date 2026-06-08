import { Redirect } from 'expo-router';

/** Ancienne route — redirige vers le hub légal. */
export default function CguRedirect() {
  return <Redirect href='/legal/cgu' />;
}
