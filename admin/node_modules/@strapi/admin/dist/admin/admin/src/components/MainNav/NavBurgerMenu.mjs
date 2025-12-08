import { jsx, jsxs } from 'react/jsx-runtime';
import { Box, Portal, FocusTrap, ScrollArea } from '@strapi/design-system';
import { motion, AnimatePresence } from 'motion/react';
import { styled } from 'styled-components';
import { HEIGHT_TOP_NAVIGATION } from '../../constants/theme.mjs';
import { MainNavBurgerMenuLinks } from './MainNavLinks.mjs';
import { NavUser } from './NavUser.mjs';

const MotionLayer = styled(motion.div)`
  position: fixed;
  top: calc(${HEIGHT_TOP_NAVIGATION} + 1px);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;

  ${({ theme })=>theme.breakpoints.large} {
    display: none;
  }
`;
const Surface = styled(Box)`
  height: 100%;
  background-color: ${({ theme })=>theme.colors.neutral0};
`;
const NavBurgerMenu = ({ isShown, handleClickOnLink, onClose, listLinks })=>{
    return /*#__PURE__*/ jsx(Portal, {
        children: /*#__PURE__*/ jsx(AnimatePresence, {
            children: isShown && /*#__PURE__*/ jsx(FocusTrap, {
                onEscape: onClose,
                children: /*#__PURE__*/ jsx(MotionLayer, {
                    role: "dialog",
                    "aria-modal": "true",
                    initial: {
                        y: '-100%'
                    },
                    animate: {
                        y: 0
                    },
                    exit: {
                        y: '-100%'
                    },
                    transition: {
                        duration: 0.2,
                        ease: 'easeInOut'
                    },
                    id: "burger-menu",
                    children: /*#__PURE__*/ jsx(Surface, {
                        children: /*#__PURE__*/ jsx(ScrollArea, {
                            children: /*#__PURE__*/ jsxs(Box, {
                                tag: "ul",
                                paddingLeft: {
                                    initial: 4,
                                    medium: 6
                                },
                                paddingRight: {
                                    initial: 4,
                                    medium: 6
                                },
                                paddingTop: {
                                    initial: 1,
                                    medium: 3
                                },
                                paddingBottom: {
                                    initial: 4,
                                    medium: 6
                                },
                                children: [
                                    /*#__PURE__*/ jsx(MainNavBurgerMenuLinks, {
                                        listLinks: listLinks,
                                        handleClickOnLink: handleClickOnLink
                                    }),
                                    /*#__PURE__*/ jsx(Box, {
                                        paddingTop: 4,
                                        tag: "li",
                                        children: /*#__PURE__*/ jsx(NavUser, {
                                            showDisplayName: true
                                        })
                                    })
                                ]
                            })
                        })
                    })
                }, "burger")
            })
        })
    });
};

export { NavBurgerMenu };
//# sourceMappingURL=NavBurgerMenu.mjs.map
