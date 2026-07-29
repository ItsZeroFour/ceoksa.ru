'use strict';

var jsxRuntime = require('react/jsx-runtime');
var designSystem = require('@strapi/design-system');
var react = require('motion/react');
var styled = require('styled-components');
var theme = require('../../constants/theme.js');
var MainNavLinks = require('./MainNavLinks.js');
var NavUser = require('./NavUser.js');

const MotionLayer = styled.styled(react.motion.div)`
  position: fixed;
  top: calc(${theme.HEIGHT_TOP_NAVIGATION} + 1px);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;

  ${({ theme })=>theme.breakpoints.large} {
    display: none;
  }
`;
const Surface = styled.styled(designSystem.Box)`
  height: 100%;
  background-color: ${({ theme })=>theme.colors.neutral0};
`;
const NavBurgerMenu = ({ isShown, handleClickOnLink, onClose, listLinks })=>{
    return /*#__PURE__*/ jsxRuntime.jsx(designSystem.Portal, {
        children: /*#__PURE__*/ jsxRuntime.jsx(react.AnimatePresence, {
            children: isShown && /*#__PURE__*/ jsxRuntime.jsx(designSystem.FocusTrap, {
                onEscape: onClose,
                children: /*#__PURE__*/ jsxRuntime.jsx(MotionLayer, {
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
                    children: /*#__PURE__*/ jsxRuntime.jsx(Surface, {
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.ScrollArea, {
                            children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
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
                                    /*#__PURE__*/ jsxRuntime.jsx(MainNavLinks.MainNavBurgerMenuLinks, {
                                        listLinks: listLinks,
                                        handleClickOnLink: handleClickOnLink
                                    }),
                                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                        paddingTop: 4,
                                        tag: "li",
                                        children: /*#__PURE__*/ jsxRuntime.jsx(NavUser.NavUser, {
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

exports.NavBurgerMenu = NavBurgerMenu;
//# sourceMappingURL=NavBurgerMenu.js.map
