import * as React from "react";

export interface IState {
  text?: string;
}

export default class TestComponent extends React.Component<{}, IState>{
  public state = {
    text: 'this is a test component'
  };
  public render() {
    const { text } = this.state;
    return (
      <div className='container'>
        <div className='label'>{text}</div>
        <button className='btn' onClick={(e) => this.handleClick()}>Click</button>
      </div>
    );
  }
  private handleClick() {
    this.setState({
      text: 'button has clicked'
    });
  }
  public componentDidMount() {
    this.setState({
      text: 'this is the changed text'
    });
  }
}