import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { useApiGoogleLogin } from "@/api/auth/login-google";
import { useRouter } from 'expo-router';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '90182123725-5qjg888ulbv96fo5eeoqudo4l934rpf4.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId:
    '90182123725-9ub5a2l6d3258l4t27ut07urc5g0n0g4.apps.googleusercontent.com',
});

export const useNativeGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { mutate, mutateAsync } = useApiGoogleLogin();
  const router = useRouter();

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo', userInfo.data?.idToken);
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        // await handleSignInWithToken(idToken);
        console.log('inside');
        // await mutateAsync(
        //   { token: idToken },
        //   {
        //     onSuccess(data, variables, context) {
        //       router.push("/(tabs)");
        //       dispatch(setAccessToken(data.accessToken));
        //       setData("sessionId", data.tokenSession.id);
        //       return;
        //     },
        //     onError(error) {
        //       setError("Failed to sign in with Google");
        //       console.error("Google Sign-In Error:");
        //       return;
        //     },
        //   }
        // );
        console.log('end');
      } else {
        setError('Failed to get ID token');
      }
    } catch (e) {
      setError('Failed to sign in with Google');
      console.error('Google Sign-In Errorcc:', e);
    } finally {
      setLoading(false);
    }
  };

  //   const handleSignInWithToken = async (idToken: string) => {
  //     mutate(
  //       { token: idToken },
  //       {
  //         onSuccess(data) {
  //           router.push("/(tabs)");
  //           dispatch(setAccessToken(data.accessToken));
  //           setData("sessionId", data.tokenSession.id);
  //         },
  //       }
  //     );
  //   };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Sign-out Error:', error);
    }
  };

  return { signIn, signOut, loading, error };
};
