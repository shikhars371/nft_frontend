import './App.css';
import Web3 from 'web3';
import asset from "./abis/Assets.json"
import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
require('dotenv').config()






const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',

  }
};

var contractAddress = "0xEE33aE7ed6B6A3D0a17334f871AF675FbCA80fb2"



class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      selectedFile: null,
      assetName: "",
      price: "",
      description: "",
      tokenId: "",
      dataList: [],
      showModal: false,
      imageName: "",
      newModel: false,
      ethadd: ""
    };
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.getlist()
    await this.getAllData()
  };

  getlist = async () => {
    axios.get("http://localhost:3000/users/getTokenId").then((resp) => {
      console.log('++++++++', resp)
      this.setState({ tokenId: resp.data.data })
    }).catch((errrs) => {
      console.log(errrs)
    })
  }

  getAllData = async () => {
    axios.get('http://localhost:3000/users/getalldata').then((listdata) => {
      console.log("====", listdata.data.data)
      this.setState({ dataList: listdata.data.data })
    }).catch((errs) => {
      console.log(errs)
    })
  }


  loadBlockchainData = async () => {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const abi = asset
    const contract = new web3.eth.Contract(abi, contractAddress)
    this.setState({ contract })
    const totalSupply = await contract.methods.totalSupply().call()
    this.setState({ totalSupply })
    // Load asset
    console.log("totalsupply&contract", totalSupply, contract)


  }


  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  };

  handleAssetName = (event) => {
    this.setState({ assetName: event.target.value })
  }

  handlePrice = (event) => {
    this.setState({ price: event.target.value })
  }

  onFileChange = event => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  handleDes = (event) => {
    this.setState({ description: event.target.value })
  }

  openModal = (data) => {
    console.log('shomodal=====', data)
    axios.post('http://localhost:3000/users/getsingledata', { "tokenId": data }).then((respo) => {
      this.setState({
        imageName: respo.data.data.artImage,
        price: respo.data.data.price,
        assetName: respo.data.data.assetName,
        description: respo.data.data.description
      })
      console.log("singledatadetails", respo.data.data.assetName)


    }).catch((er) => {
      console.log('er', er)
    })

    this.setState({ showModal: true })
  }

  closeModal = () => {
    this.setState({ showModal: false })
  }

  etherAddress = () => {
    const ethaddress = process.env.REACT_APP_PUBLIC_KEY
    console.log("address", ethaddress)
    this.setState({ ethadd: ethaddress, newModel: true })
  }

  closeModalNew = () => {
    this.setState({ newModel: false })
  }


  generateNftToken = () => {


    console.log("=====tokenid==", this.state.tokenId)
    this.state.contract.methods.mint(this.state.assetName, this.state.tokenId).send({ from: this.state.account })
      .once('receipt', (receipt) => {

        const data = new FormData()
        data.append(
          'artImage',
          this.state.selectedFile
        );
        data.append("assetName", this.state.assetName);
        data.append("price", this.state.price);
        data.append("description", this.state.description);
        data.append("owner", this.state.account);
        data.append("tokenId", this.state.tokenId)
        console.log("========", this.state.assetName, this.state.price, this.state.selectedFile, this.state.description, this.state.account, this.state.tokenId)
        let url = "http://localhost:3000/users/uploadImage";
        const config = {
          headers: { 'content-type': 'multipart/form-data' }
        }

        axios.post(url, data, config)
          .then((result) => {
            console.log("resultData", result);

          }).catch((errr) => {
            console.log(errr)
          })

        console.log("receipt", receipt)
      })




  };

  render() {

    return (
      <div style={{ textAlign: "center" }}>
        <div className="generatenftarea">
          <h1>Nft Assets</h1>

          <table>
            <tr>
              <td><label>Asset Name</label></td>
              <td><input type="text" value={this.state.assetName} onChange={this.handleAssetName} /></td>
            </tr>
            <tr>
              <td><label>Price</label></td>
              <td><input type="text" value={this.state.price} onChange={this.handlePrice} /></td>
            </tr>
            <tr>
              <td><label>Upload your img</label></td>
              <td> <input type="file" onChange={this.onFileChange} /></td>
            </tr>
            <tr>
              <td><label>Description</label></td>
              <td><input type="text" value={this.state.description} onChange={this.handleDes} /></td>
            </tr>
            <tr>

            </tr>
          </table>
          <button onClick={this.generateNftToken}> Generate Nft</button>
        </div>


        <div className="assetarea">
          {this.state.dataList.map(list => (
            <div className="assetfield" onClick={() => this.openModal(list.tokenId)} >
              <img style={{ height: 200, width: 200 }} src={"http://localhost:3000/" + list.artImage} />
              <p>Name: {list.assetName}</p>
              <p>Price: {list.price}</p>

            </div>
          ))}
        </div>

        {/* ======modal======== */}
        <Modal
          isOpen={this.state.showModal}
          style={customStyles}
          contentLabel="Example Modal"
          ariaHideApp={false}
        >

          <div className="singlemodaldetail">
            <div className="imagesection">
              <img src={"http://localhost:3000/" + this.state.imageName} />
            </div>
            <div className="detailsection">
              <h1>{this.state.assetName}</h1>
              <div className="pricebox"><h3>{this.state.price}ETH</h3></div>
              <div className="descriptionbox"><p>{this.state.description}</p></div>
              <div className="bidsection">
                <button onClick={this.etherAddress}>Buy</button>
              </div>
            </div>
          </div>

          <button className="closemodal" onClick={this.closeModal}>X</button>


        </Modal>


        <Modal
          isOpen={this.state.newModel}
          style={customStyles}
          contentLabel="Example Modal"
          ariaHideApp={false}
        >

          <div className="singlemodaldetail">
            <div className="detailsection">
              <h1>Ether Address</h1>
              <p>{this.state.ethadd}</p>
              <div className="bidsection">
                <button >Buy</button>
              </div>
            </div>
          </div>

          <button className="closemodal" onClick={this.closeModalNew}>X</button>


        </Modal>



      </div>
    )
  }
}




export default App;
