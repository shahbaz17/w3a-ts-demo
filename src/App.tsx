import {useEffect, useState} from 'react'
import {Web3Auth} from '@web3auth/web3auth'
import {CHAIN_NAMESPACES, SafeEventEmitterProvider} from '@web3auth/base'
import './App.css'
import RPC from './web3RPC' // for using web3.js
//import RPC from "./ethersRPC"; // for using ethers.js
// import {TorusWalletConnectorPlugin} from '@web3auth/torus-wallet-connector-plugin'
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider'
import {SolanaPrivateKeyProvider, SolanaWallet} from '@web3auth/solana-provider'
import Web3 from 'web3'

const clientId =
  'BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo' // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null,
  )

  useEffect(() => {
    const init = async () => {
      try {
        // ETH_Ropsten
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
          },
        })

        setWeb3auth(web3auth)

        await web3auth.initModal()

        // To hide external wallet options
        // await web3auth.initModal({
        //   modalConfig: {
        //     'torus-evm': {
        //       label: 'Torus Wallet',
        //       showOnModal: false,
        //     },
        //     metamask: {
        //       label: 'Metamask',
        //       showOnModal: false,
        //     },
        //     'wallet-connect-v1': {
        //       label: 'Wallet Connect',
        //       showOnModal: false,
        //     },
        //   },
        // })

        // const torusPlugin = new TorusWalletConnectorPlugin({
        //   torusWalletOpts: {
        //     buttonPosition: 'bottom-left',
        //   },
        //   walletInitOptions: {
        //     whiteLabel: {
        //       theme: {isDark: true, colors: {primary: '#00a8ff'}},
        //       logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
        //       logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
        //     },
        //     useWalletConnect: true,
        //     enableLogging: true,
        //   },
        // })

        // torusPlugin.initWithProvider(provider_from_wagmi, userInfo)

        // torusPlugin.initiateTopup('moonpay', {
        //   selectedAddress: 'address',
        //   selectedCurrency: 'USD',
        //   fiatValue: 100,
        //   selectedCryptoCurrency: 'ETH',
        //   chainNetwork: 'mainnet',
        // })

        // await web3auth.addPlugin(torusPlugin)

        if (web3auth.provider) {
          setProvider(web3auth.provider)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const getAllAccounts = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const privateKey = await rpc.getPrivateKey()
    console.log(privateKey)

    // Get user's Polygon's public address
    const polygonPrivateKeyProvider = new EthereumPrivateKeyProvider({
      config: {
        chainConfig: {
          chainId: '0x13881',
          rpcTarget: 'https://rpc.ankr.com/polygon_mumbai',
          displayName: 'Polygon Mumbai',
          blockExplorer: 'https://mumbai.polygonscan.com/',
          ticker: 'MATIC',
          tickerName: 'MATIC',
        },
      },
    })
    await polygonPrivateKeyProvider.setupProvider(privateKey)
    const web3_polygon = new Web3(polygonPrivateKeyProvider.provider as any)
    const polygon_address = (await web3_polygon.eth.getAccounts())[0]

    // Get user's BNB's public address
    const bnbPrivateKeyProvider = new EthereumPrivateKeyProvider({
      config: {
        chainConfig: {
          chainId: '0x38',
          rpcTarget: 'https://rpc.ankr.com/bsc',
          displayName: 'Binance SmartChain Mainnet',
          blockExplorer: 'https://bscscan.com/',
          ticker: 'BNB',
          tickerName: 'BNB',
        },
      },
    })
    await bnbPrivateKeyProvider.setupProvider(privateKey)
    const web3_bnb = new Web3(polygonPrivateKeyProvider.provider as any)
    const bnb_address = (await web3_bnb.eth.getAccounts())[0]

    const {getED25519Key} = await import('@toruslabs/openlogin-ed25519')
    const ed25519key = getED25519Key(privateKey).sk.toString('hex')
    console.log(ed25519key)

    // Get user's Polygon's public address
    const solanaPrivateKeyProvider = new SolanaPrivateKeyProvider({
      config: {
        chainConfig: {
          chainId: '0x3',
          rpcTarget: 'https://ssc-dao.genesysgo.net',
          displayName: 'Solana Mainnet',
          blockExplorer: 'https://explorer.solana.com/',
          ticker: 'SOL',
          tickerName: 'Solana',
        },
      },
    })
    await solanaPrivateKeyProvider.setupProvider(ed25519key)
    console.log(solanaPrivateKeyProvider.provider)

    const solanaWallet = new SolanaWallet(
      solanaPrivateKeyProvider.provider as any,
    )
    const solana_address = await solanaWallet.requestAccounts()

    uiConsole(
      'Polygon Address: ' + polygon_address,
      'BNB Address: ' + bnb_address,
      'Solana Address: ' + solana_address[0],
    )
  }

  const login = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const web3authProvider = await web3auth.connect()
    setProvider(web3authProvider)
  }

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const user = await web3auth.getUserInfo()
    uiConsole(user)
  }

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const idToken = await web3auth.authenticateUser()
    uiConsole(idToken)
  }

  const parseToken = async () => {
    const idToken = await web3auth?.authenticateUser()
    console.log(idToken?.idToken)
    const base64Url = idToken?.idToken.split('.')[1]
    const base64 = base64Url?.replace('-', '+').replace('_', '/')
    const result = JSON.parse(window.atob(base64 || ''))
    uiConsole(result)
  }

  const logout = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    await web3auth.logout()
    setProvider(null)
  }

  const getChainId = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const chainId = await rpc.getChainId()
    uiConsole(chainId)
  }
  const getAccounts = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const address = await rpc.getAccounts()
    uiConsole('ETH Address: ' + address)
  }

  const getBalance = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const balance = await rpc.getBalance()
    uiConsole(balance)
  }

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const receipt = await rpc.sendTransaction()
    uiConsole(receipt)
  }

  const signMessage = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const signedMessage = await rpc.signMessage()
    uiConsole(signedMessage)
  }

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const rpc = new RPC(provider)
    const privateKey = await rpc.getPrivateKey()
    uiConsole(privateKey)
  }

  function uiConsole(...args: any[]): void {
    const el = document.querySelector('#console>p')
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2)
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get idToken
          </button>
        </div>
        <div>
          <button onClick={parseToken} className="card">
            Parse idToken
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getAllAccounts} className="card">
            Get All Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
      <div id="console" style={{whiteSpace: 'pre-line'}}>
        <p style={{whiteSpace: 'pre-line'}}></p>
      </div>
    </>
  )

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  )

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth{' '}
        </a>
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  )
}

export default App
