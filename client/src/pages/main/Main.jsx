import React, { lazy } from "react";
const Head = lazy(() => import("./head/Head"));
const Credit = lazy(() => import("./credit/Credit"));
const Advantages = lazy(() => import("./advantages/Advantages"));
const BestOffer = lazy(() => import("./best_offer/BestOffer"));
const Service = lazy(() => import("./service/Service"));
const HowGet = lazy(() => import("./how_get/HowGet"));
const Banks = lazy(() => import("./banks/Banks"));
const Sequrity = lazy(() => import("./sequrity/Sequrity"));

const Main = ({ scrollToBlock, setOpenAuthMenu, openAuthMenu }) => {
  return (
    <div>
      <Head scrollToBlock={scrollToBlock} />
      <Credit setOpenAuthMenu={setOpenAuthMenu} openAuthMenu={openAuthMenu} />
      <Advantages />
      <BestOffer scrollToBlock={scrollToBlock} />
      <Service />
      <HowGet scrollToBlock={scrollToBlock} />
      <Banks />
      <Sequrity scrollToBlock={scrollToBlock} />
    </div>
  );
};

export default Main;
