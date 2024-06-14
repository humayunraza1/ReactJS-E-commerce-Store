import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Layout, Menu, Row, theme } from 'antd';
import Hero from './Hero';
import ProductCard from './ProductCard';
const { Header, Content, Footer, Sider } = Layout;
const items1 = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});
const Design = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Hero/>
      <Content
        style={{
          height: '100dvh',
        }}
      >
        <Layout
          style={{
            padding: '24px 0',
            height: '100dvh',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider
            style={{
              background: colorBgContainer,
            }}
            width={300}
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{
                height: '100%',
              }}
              items={items2}
            />
          </Sider>
          <Content
            style={{
              padding: '0 24px',
              minHeight: 280,
            }}
          >
            <Row gutter={[16, 24]}>
            <Col className="gutter-row"
                                xs={{
                                  flex: '100%',
                                }}
                                sm={{
                                  flex: '50%',
                                }}
                                md={{
                                  flex: '40%',
                                }}
                                lg={{
                                  flex: '20%',
                                }}
                                xl={{
                                  flex: '10%',
                                }}>
            <ProductCard/>
            </Col>
            <Col className="gutter-row"
                                xs={{
                                  flex: '100%',
                                }}
                                sm={{
                                  flex: '50%',
                                }}
                                md={{
                                  flex: '40%',
                                }}
                                lg={{
                                  flex: '20%',
                                }}
                                xl={{
                                  flex: '10%',
                                }}>
            <ProductCard/>
            </Col>
            <Col className="gutter-row"
                                xs={{
                                  flex: '100%',
                                }}
                                sm={{
                                  flex: '50%',
                                }}
                                md={{
                                  flex: '40%',
                                }}
                                lg={{
                                  flex: '20%',
                                }}
                                xl={{
                                  flex: '10%',
                                }}>
            <ProductCard/>
            </Col>
            <Col className="gutter-row"
                                xs={{
                                  flex: '100%',
                                }}
                                sm={{
                                  flex: '50%',
                                }}
                                md={{
                                  flex: '40%',
                                }}
                                lg={{
                                  flex: '20%',
                                }}
                                xl={{
                                  flex: '10%',
                                }}>
            <ProductCard/>
            </Col>
            <Col className="gutter-row"
                                xs={{
                                  flex: '100%',
                                }}
                                sm={{
                                  flex: '50%',
                                }}
                                md={{
                                  flex: '40%',
                                }}
                                lg={{
                                  flex: '20%',
                                }}
                                xl={{
                                  flex: '10%',
                                }}>
            <ProductCard/>
            </Col>
            </Row>
          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};
export default Design;