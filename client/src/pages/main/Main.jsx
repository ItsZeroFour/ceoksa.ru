import React from "react";
import Head from "./head/Head";
import Credit from "./credit/Credit";
import Advantages from "./advantages/Advantages";
import BestOffer from "./best_offer/BestOffer";
import Service from "./service/Service";
import HowGet from "./how_get/HowGet";
import Banks from "./banks/Banks";
import Sequrity from "./sequrity/Sequrity";

const Main = ({ scrollToBlock }) => {
  return (
    <div>
      <Head scrollToBlock={scrollToBlock} />
      <Credit />
      <Advantages />
      <BestOffer scrollToBlock={scrollToBlock} />
      <Service />
      <HowGet scrollToBlock={scrollToBlock} />
      <Banks />
      <Sequrity />
    </div>
  );
};

export default Main;
