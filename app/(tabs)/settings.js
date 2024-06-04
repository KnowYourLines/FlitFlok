import React, { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { useRouter } from "expo-router";
import Button from "../../components/Button.js";
import { auth } from "../../firebaseConfig.js";
import SignIn from "../../components/SignIn.js";

export default function Page() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      if (user.emailVerified) {
        user.getIdToken(true).then(async (token) => {
          const response = await fetch(`${backendUrl}/rank/`, {
            method: "GET",
            headers: new Headers({
              Authorization: token,
            }),
          });
          const responseJson = await response.json();
          if (response.status != 200) {
            Alert.alert(
              `${response.status} error: ${JSON.stringify(responseJson)}`
            );
          } else {
            setUserRank(responseJson.rank);
          }
        });
      }
    }
  });
  return (
    <View style={styles.container}>
      {user && user.emailVerified && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>{user.uid}</Text>
          <Text style={styles.subtitle}>You are the #{userRank} explorer</Text>
          <Button
            title={"Sign Out"}
            color="#2196F3"
            onPress={() => {
              auth.signOut().catch((error) => {
                Alert.alert("Error", error.message);
              });
            }}
          />
          <View style={styles.footer}>
            <Button
              title={"Delete Account"}
              onPress={() => {
                Alert.alert(
                  "Delete all account data?",
                  "This cannot be undone",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        auth
                          .signOut()
                          .then(() => {
                            user.getIdToken(true).then((token) => {
                              fetch(`${backendUrl}/delete-account/`, {
                                method: "DELETE",
                                headers: new Headers({
                                  Authorization: token,
                                }),
                              })
                                .then((response) => {
                                  if (response.status == 204) {
                                    router.replace("/");
                                  }
                                })
                                .catch((error) => {
                                  Alert.alert("Error", error);
                                });
                            });
                          })
                          .catch((error) => {
                            Alert.alert("Error", error.message);
                          });
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>
      )}
      {user && user.isAnonymous && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>This is a guest account</Text>
          <SignIn updateUser={setUser}></SignIn>
          <View style={styles.footer}>
            <Button
              title={"Delete Account"}
              onPress={() => {
                Alert.alert(
                  "Delete all account data?",
                  "This cannot be undone",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        auth
                          .signOut()
                          .then(() => {
                            user.getIdToken(true).then((token) => {
                              fetch(`${backendUrl}/delete-account/`, {
                                method: "DELETE",
                                headers: new Headers({
                                  Authorization: token,
                                }),
                              })
                                .then((response) => {
                                  if (response.status == 204) {
                                    router.replace("/");
                                  }
                                })
                                .catch((error) => {
                                  Alert.alert("Error", error);
                                });
                            });
                          })
                          .catch((error) => {
                            Alert.alert("Error", error.message);
                          });
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>
      )}
      {user && user.email && !user.emailVerified && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>
            Verification email sent to {user.email}
          </Text>
          <Button
            title={"Continue to sign in"}
            color="#2196F3"
            onPress={() => {
              auth.signOut().catch((error) => {
                Alert.alert("Error", error.message);
              });
            }}
          />
          <Text
            style={styles.textToggle}
            onPress={() => {
              sendEmailVerification(user)
                .then(() => {
                  Alert.alert(
                    "Check your spam or inbox to verify your email address."
                  );
                })
                .catch((error) => {
                  Alert.alert("Error", error.message);
                });
            }}
          >
            {"Didn't get it? Resend."}
          </Text>
          <View style={styles.footer}>
            <Button
              title={"Delete Account"}
              onPress={() => {
                Alert.alert(
                  "Delete all account data?",
                  "This cannot be undone",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        auth
                          .signOut()
                          .then(() => {
                            user.getIdToken(true).then((token) => {
                              fetch(`${backendUrl}/delete-account/`, {
                                method: "DELETE",
                                headers: new Headers({
                                  Authorization: token,
                                }),
                              })
                                .then((response) => {
                                  if (response.status == 204) {
                                    router.replace("/");
                                  }
                                })
                                .catch((error) => {
                                  Alert.alert(error);
                                });
                            });
                          })
                          .catch((error) => {
                            Alert.alert("Error", error.message);
                          });
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    marginTop: "10%",
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  textToggle: {
    padding: 10,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "blue",
  },
});
