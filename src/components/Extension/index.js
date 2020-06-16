import browser from 'webextension-polyfill';
import React from 'react';
import EContext from '../../lib/context';


class Extension extends React.Component {
    constructor(props) {
        super(props)
        // the initial application state
        this.state = {
            in_focus: true,
            window_id: null,
        }
    }

    

    componentWillMount() {
        this.setCurrentWindow();
    }

    componentDidMount() {
        // update window status
        browser.windows.onFocusChanged.addListener((window) => {
            if (window == browser.windows.WINDOW_ID_NONE) {
                this.setState({
                    in_focus: false
                })
            } else {
                this.setState({
                    in_focus: true
                })
            }
        });

        // show window on click
        browser.notifications.onClicked.addListener(this.showWindow);
    }

    // sett current window id for react comp
    setCurrentWindow = () => {
        browser.storage.sync.get(/* String or Array */"window_id").then((data) => {
            this.setState({
                window_id: data.window_id,
            })
        });
    }

    showWindow = () => {
        browser.windows.update(this.state.window_id, {focused: true}).then(() => {
        // focus window if exists and create one if there was en error
            if (browser.runtime.lastError) {
                console.log("wtfff error when updating window")
            }
        });
    }

    createNotification = async (opt) => {
        if (!this.state.in_focus) {
            browser.notifications.create(opt);
            this.playMusic(1);
        }
        else
            console.log("browser in  focus no need");
    }

    playMusic = async (type) => {
        var audio = document.createElement('audio');
        audio.setAttribute('preload', 'auto');
        audio.setAttribute('autobuffer', 'true');
        var path = '/sounds/' + type + '.wav';
        audio.src = path;
        audio.volume = 1;
        audio.play();
    }

    render() {
        return (
            <EContext.Provider
                value={{
                    window_id: this.state.window_id,
                    in_focus: this.state.in_focus,
                    createNotification: this.createNotification
                }}
            >
                {this.props.children}
            </EContext.Provider>
        );
    }
}

export default Extension;
