import { useState } from "react";
import React from "react";


import { 
  Button,
  Flex ,
  message, 
  Space,
  Layout,
  theme} from 'antd';
import {
  InfoCircleOutlined,
  WarningOutlined,
  BellOutlined,
  ThunderboltOutlined,
  HeartOutlined} from '@ant-design/icons';


export default function Home() {

  const [timer, settimer] = useState(0);
  const [soundname, setsoundname] = useState("null");


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { Header, Sider, Content } = Layout;

  const [messageApi, contextHolder] = message.useMessage();

    const button1 = ('/sounds/button1.mp3');
    const button2 = ('/sounds/button2.mp3');
    const button3 = ('/sounds/button3.mp3');
    const button4 = ('/sounds/button4-re2.mp3');
    const chime = ('/sounds/chime-re.mp3');
    const heartbeat = ('/sounds/heartbeat2.mp3');
    const transceiver = ('/sounds/transceiver.mp3');
    const alart1 = ('/sounds/alart1-re.mp3');
    const alart2 = ('/sounds/alart2-re.mp3');
  
  





  const playSound = (pass: string,sec:number) => {
    settimer(sec)
    setsoundname(pass)
    const audio = new Audio(pass);
    if (audio) {
      audio.currentTime = 0; 
      
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
      });


      const intervalId = setInterval(() =>{
        sec--
        if(sec < 0){
          clearInterval(intervalId);
          return
        }else{
          settimer(sec)
        }
      
      }, 1000);
    }
  };

  

  const playearthquark = () => {
  const sound1 = new Audio('/sounds/a2.mp3');
  const sound2 = new Audio('/sounds/b.mp3');

  sound1.play().catch(console.error);

        var sec = 8
        settimer(8)
        setsoundname("/sounds/a2.mp3")
      const intervalId = setInterval(() =>{
  
        sec--
        if(sec < 0){
          clearInterval(intervalId);
          return
        }else{
          settimer(sec)
        }
      
      }, 1000);

  const delaySeconds = 6;
  setTimeout(() => {
    sound2.play().catch(console.error);
  }, delaySeconds * 1000);
};


  return (
    
    <main className="min-h-full bg-gray-300 p-8">
      {contextHolder}
      <div className="max-w-auto mx-auto bg-white rounded-4xl shadow-2xl flex overflow-hidden">
        <Layout>
          <Layout>
            <Header style={{margin: '0px 0px', padding: 0, minHeight :80,background: colorBgContainer }}>
              <Flex align="center" vertical >
                <div className="w-full mt-1 text-black text-center text-2xl font-bold" >Sound Board
                <div className={`text-sm font-medium ${timer>0 ? "text-sky-400":"text-black"}`}>Current Sound : {soundname} 
                <div className={`text-sm font-medium ${timer>0 ? "text-sky-400":"text-black"}`}>Remain: {timer} s</div></div></div>  
              </Flex>
            </Header>
            <Content
              style={{
                margin: '10px 0px',
                padding: 30,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: 30,
                
              }}
            >

            <Space size={[10,40]} direction="vertical" align="center">
              <Flex gap={20} align="center">

                <Button 
                  color="red" 
                  variant="solid" 
                  shape="round" 
                  icon={<HeartOutlined />} 
                  onClick={()=> playSound(heartbeat,12)} 
                  size="middle">鼓動音
                </Button>  
                <Button 
                  color="orange" 
                  variant="solid" 
                  shape="round" 
                  icon={<ThunderboltOutlined />} 
                  onClick={playearthquark} 
                  size="middle"
                  >亀裂音
                </Button>   
              </Flex>



              <Flex gap={20} align="center">


                 {/* <Button 
                  color="blue" 
                  variant="solid" 
                  shape="round" 
                  icon={<PhoneOutlined />} 
                  onClick={()=> playSound(transceiver,1)} 
                  size="middle">transceiver
                </Button>  */}
                <Button 
                  color="gold" 
                  variant="solid" 
                  shape="round" 
                  icon={<BellOutlined />} 
                  onClick={()=> playSound(chime,1)} 
                  size="middle">チャイム
                </Button>   
              </Flex>



              <Flex gap={20} align="center">
                <Button 
                  color="volcano" 
                  variant="solid" 
                  shape="round" 
                  icon={<WarningOutlined />} 
                  onClick={()=> playSound(alart1,7)} 
                  size="middle">警報1
                </Button>   
      
              </Flex>

              <Flex gap={20} align="center">         
                <Button 
                  color="volcano" 
                  variant="solid" 
                  shape="round" 
                  icon={<WarningOutlined />} 
                  onClick={()=> playSound(alart2,7)} 
                  size="middle">警報2
                </Button>  


                <Button 
                  color="geekblue" 
                  variant="solid" 
                  shape="round" 
                  icon={<InfoCircleOutlined />} 
                  onClick={()=> playSound(button4,1)} 
                  size="middle">ボタン
                </Button>  
              </Flex>


        
            </Space>
            <div className="mt-10"/>

            <div>効果音:</div>
            <div>OtoLogic(https://otologic.jp)</div>
            <div>Springin' Sound Stock</div>
            <div>On-Jin ～音人～</div>
          </Content>
          </Layout>
        </Layout>
      </div>

    </main>
  );
}
