/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import '@railgun-community/wallet/react-native-shims';
import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  startRailgunEngine,
  loadProvider,
  ArtifactStore,
  setLoggers,
  setOnBalanceUpdateCallback,
} from '@railgun-community/wallet';
// @ts-ignore
import memdown from 'memdown';
import fs from 'react-native-fs';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const providerConfigEthereum = {
  networkName: 'Ethereum',
  chainId: 1,
  providers: [
    {
      provider: 'https://cloudflare-eth.com/',
      priority: 1,
      weight: 1,
    },
    {
      provider: 'https://rpc.ankr.com/eth',
      priority: 2,
      weight: 1,
    },
    {
      provider: 'https://railwayapi.xyz/rpc/pokt/eth-mainnet',
      priority: 1,
      weight: 2,
      stallTimeout: 2500,
    },
    {
      provider: 'https://railwayapi.xyz/rpc/alchemy/eth-mainnet',
      priority: 2,
      weight: 2,
    },
  ],
};

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [erc20Amounts, setErc20Amounts] = React.useState<any[] | null>(null);

  useEffect(() => {
    (async function () {
      const getFile = async (path: string) =>
        fs.readFile(`${fs.DocumentDirectoryPath}/${path}`);

      const storeFile = async (
        dir: string,
        path: string,
        item: string | Uint8Array,
      ) => {
        await fs.mkdir(`${fs.DocumentDirectoryPath}/${dir}`);
        await fs.writeFile(
          `${fs.DocumentDirectoryPath}/${path}`,
          item as string,
        );
      };

      const fileExists = async (path: string): Promise<boolean> =>
        await fs.exists(`${fs.DocumentDirectoryPath}/${path}`);

      const artifactStore = new ArtifactStore(getFile, storeFile, fileExists);
      const shouldDebug = true;
      const useNativeArtifacts = true;
      const skipMerkletreeScans = false;

      setLoggers(console.log, console.error);
      startRailgunEngine(
        'RNRailgunExample',
        memdown(),
        shouldDebug,
        artifactStore,
        useNativeArtifacts,
        skipMerkletreeScans,
      );

      setOnBalanceUpdateCallback(balances => {
        setErc20Amounts(balances.erc20Amounts);
      });

      const feesSerialized = await loadProvider(
        providerConfigEthereum,
        providerConfigEthereum.networkName as any,
      );
      console.log(
        'Loaded providers, with fees:',
        JSON.stringify(feesSerialized),
      );
    })();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="RNRailgunExample">
            {erc20Amounts ? 'Balances:' : 'Loading... (may take 15min)'}
            {erc20Amounts?.map(({tokenAddress, amount}, index) => (
              <Text key={index}>
                {'\n'}
                {tokenAddress} has {amount.toString()}
              </Text>
            ))}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
