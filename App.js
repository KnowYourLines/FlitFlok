import Home from "./components/Home.js";
import NoInternet from "./components/NoInternet.js";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { useNetInfo } from "@react-native-community/netinfo";

export default function App() {
  const netInfo = useNetInfo();
  if (!netInfo.isInternetReachable && netInfo.isInternetReachable !== null) {
    return <NoInternet></NoInternet>;
  }
  return (
    <Provider store={store}>
      <Home></Home>
    </Provider>
  );
}
