import React from "react";
import VisibilityContext from './lib/visibility_context';

export function getBrowserVisibilityProp() {
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    return "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    return "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitvisibilitychange";
  }
}

export function getBrowserDocumentHiddenProp() {
  if (typeof document.hidden !== "undefined") {
    return "hidden";
  } else if (typeof document.msHidden !== "undefined") {
    return "msHidden";
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitHidden";
  }
}

export function getIsDocumentHidden() {
  return !document[getBrowserDocumentHiddenProp()];
}

const pageVisibilityApi = () => {
  let hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  return { hidden, visibilityChange };
};


const { hidden, visibilityChange } = pageVisibilityApi();

class VisibilityProvider extends React.Component {
  state = {
    isVisible: true
  };

  componentDidMount() {
    document.addEventListener(visibilityChange, this.handleVisibilityChange, false);

    document.addEventListener("focus", this.forceVisibilityTrue, false);
    document.addEventListener("blur", this.forceVisibilityFalse, false);

    window.addEventListener("focus", this.forceVisibilityTrue, false);
    window.addEventListener("blur", this.forceVisibilityFalse, false);
  }

  handleVisibilityChange = forcedFlag => {
    // this part handles when it's triggered by the focus and blur events
    if (typeof forcedFlag === "boolean") {
      if (forcedFlag) {
        return this.setVisibility(true);
      }
      return this.setVisibility(false);
    }

    // this part handles when it's triggered by the page visibility change events
    if (document[hidden]) {
      return this.setVisibility(false);
    }
    return this.setVisibility(true);
  };

  forceVisibilityTrue = () => {
    this.handleVisibilityChange(true);
  };

  forceVisibilityFalse = () => {
    this.handleVisibilityChange(false);
  };

  setVisibility = flag => {
    this.setState(prevState => {
      if (prevState.isVisible === flag) return null;
      return { isVisible: flag };
    });
  };

  componentWillUnmount() {
    document.removeEventListener(visibilityChange, this.handleVisibilityChange, false);

    document.removeEventListener("focus", this.forceVisibilityTrue, false);
    document.removeEventListener("blur", this.forceVisibilityFalse, false);

    window.removeEventListener("focus", this.forceVisibilityTrue, false);
    window.removeEventListener("blur", this.forceVisibilityFalse, false);
  }

  render() {
    return (
      <VisibilityContext.Provider
        value={{
          ...this.pros,
          isVisible: this.state.isVisible,
        }}
      >
        {this.props.children}
      </VisibilityContext.Provider>
    )
  }

}

export default VisibilityProvider;