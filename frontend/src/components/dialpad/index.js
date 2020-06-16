import React from 'react';
import Icon from '../icon';
import {
    CallButton,
    NumberDescElement,
    NumberElement,
    DescContainer,
    ActionCol,
    ActionRow,
    InputRow,
    DialpadInput,
    DialpadRow,

} from './style';

class Digit extends React.Component {
    render() {
        const { symbol, alias, digitPressed } = this.props;
        return (
            <CallButton
                onClick={() => { digitPressed(symbol) }}

                style={{ outline: 'none' }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: '1',
                    flexShrink: '0',
                    overflow: 'hidden',
                    alignItems: 'stretch',
                    alignSelf: 'center',
                }}>
                    <NumberElement style={{ flexDirection: alias ? 'column' : 'row' }}>{symbol}</NumberElement>
                    {alias &&
                        <DescContainer>
                            <NumberDescElement>
                                {alias}
                            </NumberDescElement>
                        </DescContainer>
                    }
                </div>
            </CallButton>
        )
    }
}


class Numpad extends React.Component {
    render() {
        const digits = [
            {
                symbol: '1'
            },
            {
                symbol: '2',
                alias: 'abc'
            },
            {
                symbol: '3',
                alias: 'def'
            },
            {
                symbol: '4',
                alias: 'ghi'
            },
            {
                symbol: '5',
                alias: 'jkl'
            },
            {
                symbol: '6',
                alias: 'mno'
            },
            {
                symbol: '7',
                alias: 'pqrs'
            },
            {
                symbol: '8',
                alias: 'tuv'
            },
            {
                symbol: '9',
                alias: 'wxyz'
            },
            {
                symbol: '*'
            },
            {
                symbol: '0'
            },
            {
                symbol: '#'
            }
        ];
        // send dtmf if in call
        const { digitPressed } = this.props;
        const digitList = digits.map((button, i) => {
            return (
                <Digit
                    symbol={button.symbol}
                    alias={button.alias}
                    digitPressed={digitPressed}
                    key={i}
                />
            )
        })
        return (
            <>
                <DialpadRow>
                    {
                        digitList.slice(0, 3)
                    }
                </DialpadRow>
                <DialpadRow>
                    {
                        digitList.slice(3, 6)
                    }
                </DialpadRow>
                <DialpadRow>
                    {
                        digitList.slice(6, 9)
                    }
                </DialpadRow>
                <DialpadRow>
                    {
                        digitList.slice(9, 12)
                    }
                </DialpadRow>
            </>
        )


    }
}


class ActionPad extends React.Component {
    render() {
        const { isDTMF, isTransfer, onBackPressed, onCallPressed } = this.props;
        return (
            <ActionRow data-cy={"action-pad-row"}>
                <ActionCol>
                    {
                        (!isTransfer) &&
                        <CallButton style={{ flexDirection: 'column', outline: 'none' }}>
                            <Icon glyph="member-add" />
                            <DescContainer>
                                <NumberDescElement>
                                    Kişi Ekle
                                    </NumberDescElement>
                            </DescContainer>
                        </CallButton>
                    }
                </ActionCol>
                {
                    (isDTMF) ?
                        <></> :
                        <>
                        <ActionCol>
                            <CallButton style={{ flexDirection: 'column', outline: 'none' }}
                                onClick={() => { onCallPressed() }}
                            >
                                <Icon glyph="call-dialpad" />
                                <DescContainer>
                                    <NumberDescElement>
                                        {
                                            (isTransfer) ? 'Transfer Et' : 'Ara'
                                        }
                                    </NumberDescElement>
                                </DescContainer>
                            </CallButton>
                        </ActionCol>
                        <ActionCol>
                            <CallButton
                                onClick={() => { onBackPressed() }}
                                style={{ flexDirection: 'column', outline: 'none' }}>
                                <Icon glyph="feather-delete" />
                            </CallButton>
                        </ActionCol>
                        </>
                }
            </ActionRow>
        )
    }
}

export default class Dialpad extends React.Component {
    state = {
        inputText: ''
    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.onCallPressedCustom();
        }

    }

    onDigitPressed = (digit) => {
        this.setState({
            inputText: this.state.inputText + digit,
        });
        if (this.props.onDigitPressed) {
            this.props.onDigitPressed(digit);
        }
    }

    onChange = (e) => {
        this.setState({
            inputText: e.target.value,
        })
    }
    onCallPressedCustom = () => {
        this.props.closeModal(false)
        this.props.onCallPressed(this.state.inputText);
    }

    onBackPressed = () => {
        if (this.state.inputText.length > 0) {
            this.setState({
                inputText: this.state.inputText.substring(0, this.state.inputText.length - 1)
            })
        }
    }
    onAddContactPressed = () => {

    }

    render() {
        return (
            <>
                <InputRow style={{ minHeight: '100px' }}>
                    <DialpadInput
                        data-cy={"data-input"}
                        value={this.state.inputText}
                        placeholder={this.props.isDTMF ? "" : "isim veya numara girin"}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                    />
                </InputRow>
                <Numpad data-cy={"numpad"} digitPressed={this.onDigitPressed} />
                <ActionPad
                    isTransfer={this.props.isTransfer}
                    isDTMF={this.props.isDTMF}
                    onBackPressed={this.onBackPressed}
                    onCallPressed={this.onCallPressedCustom}
                    onAddContactPressed={this.onAddContactPressed}
                />
            </>
        )
    }
}