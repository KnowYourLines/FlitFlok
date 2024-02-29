import Home from "./components/Home.js";
import { store } from "./store";
import { Provider } from "react-redux";

export default function App() {
  return (
    <Provider store={store}>
      <Home></Home>
    </Provider>
  );
}
