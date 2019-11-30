import React, { Component } from 'react';
import { Layout, message, Menu, Tabs, Tooltip, Icon, Input } from 'antd';
import { debounce } from 'lodash';
import { api } from './config';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuData: [],
      kubernetesData: [],
      menus: [],
      panes: [],
      openKeys: [],
      iframeHeight: 0,
      activeKey: undefined,
    };
    this.openKeys = [];
    this.handleResize = debounce(this.handleResize, 500);
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchDocker();
    this.fetchKubernetes();
    this.handleResize();
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.handleResize());
  }

  componentWillUnmount() {
    this._isMounted = false;
    // 解除监听
    window.removeEventListener('resize', () => this.handleResize());
  }

  fetchDocker = () => {
    const url = `${api}/api/docker/containers`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (this._isMounted) {
          if (Array.isArray(data)) {
            const menuData = {
              title: <span>docker</span>,
              value: 'docker',
              key: 'docker',
              children: data.map(item => ({
                title: <span>{item}</span>,
                value: item,
                key: `docker.${item}`,
              })),
            };
            this.setState({
              menuData: [...this.state.menuData, menuData],
              menus: [...this.state.menus, this.parseMenu(menuData)],
            });
          } else {
            console.log(data);
          }
        }
      })
      .catch(err => {
        if (this._isMounted) {
          console.log(err);
        }
      });
  };

  fetchKubernetes = () => {
    const url = `${api}/api/kubernetes/containers`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (this._isMounted) {
          if (Array.isArray(data)) {
            const menuData = {
              title: <span>kubernetes</span>,
              value: 'kubernetes',
              key: 'kubernetes',
              children: data.map(item => ({
                title: <span>{item.namespace}</span>,
                value: item.namespace,
                key: `kubernetes.${item.namespace}`,
                children: item.pods.map(pod => ({
                  title: <span>{pod.name}</span>,
                  value: pod.name,
                  key: `kubernetes.${item.namespace}.${pod.name}`,
                  children: pod.containers.map(container => ({
                    title: <span>{container}</span>,
                    value: container,
                    key: `kubernetes.${item.namespace}.${pod.name}.${container}`,
                  })),
                })),
              })),
            };
            this.setState({
              menuData: [...this.state.menuData, menuData],
              menus: [...this.state.menus, this.parseMenu(menuData)],
            });
          } else {
            console.log(data);
          }
        }
      })
      .catch(err => {
        if (this._isMounted) {
          console.log(err);
        }
      });
  };

  handleResize = () => {
    // 自适应终端大小
    const bodyHeight = document.body.getBoundingClientRect().height;
    const bodyWidth = document.body.getBoundingClientRect().width;
    const iframeHeight = bodyHeight - 40;
    const iframeWidth = bodyWidth - 200;
    if (iframeHeight > 100 && iframeWidth > 100) {
      this.state.panes.forEach(pane => {
        pane.content = (
          <iframe
            id={pane.key}
            src={pane.url}
            title={pane.title}
            style={{ border: 0, height: iframeHeight, width: iframeWidth }}
          />
        );
      });
      this.setState({ iframeHeight });
    } else {
      this.state.panes.forEach(pane => {
        pane.content = undefined;
      });
      if (this.state.panes.length > 0) {
        message.error('窗口太小');
      }
    }
  };

  parseMenu = value => {
    // console.log(value.title);
    if (Array.isArray(value.children)) {
      return (
        <Menu.SubMenu
          key={value.key}
          title={<Tooltip title={value.title}>{value.title}</Tooltip>}
        >
          {value.children.map(this.parseMenu)}
        </Menu.SubMenu>
      );
    } else {
      return (
        <Menu.Item key={value.key} onDoubleClick={() => this.add(value.key)}>
          <Icon type="cloud" />
          {value.title}
        </Menu.Item>
      );
    }
  };

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = value => {
    const { panes } = this.state;
    const activeKey = value;
    if (panes.some(pane => pane.key === activeKey)) {
      this.setState({ panes, activeKey });
    } else {
      const containerArr = value.split('.');
      const title = containerArr[containerArr.length - 1];
      const url = `/terminal/${containerArr.join('/')}`;
      panes.push({
        title,
        url,
        content: (
          <iframe
            id={activeKey}
            src={url}
            title={title}
            style={{
              border: 0,
              height: this.state.iframeHeight,
              width: '100%',
            }}
          />
        ),
        key: activeKey,
      });
      this.setState({ panes, activeKey });
    }
  };

  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({ panes, activeKey });
  };

  onOpenChange = openKeys => {
    this.setState({ openKeys });
  };

  onSearch = e => {
    // 自动展开菜单有点卡顿，暂时不用
    const search = e.target.value;
    this.openKeys = [];
    if (search) {
      const menuData = this.state.menuData
        .map(menu => this.searchMenu(menu, search, search))
        .filter(menu => menu !== null);
      this.setState({
        // openKeys: this.openKeys,
        menus: menuData.map(this.parseMenu),
      });
    } else {
      this.setState({
        // openKeys: this.openKeys,
        menus: this.state.menuData.map(this.parseMenu),
      });
    }
  };

  searchMenu = (menu, search, _search) => {
    let title = menu.title;
    if (_search) {
      const index = menu.value.indexOf(_search);
      const beforeStr = menu.value.substr(0, index);
      const afterStr = menu.value.substr(index + _search.length);
      if (index > -1) {
        title = (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{_search}</span>
            {afterStr}
          </span>
        );
      }
    }

    if (Array.isArray(menu.children)) {
      if (Array.isArray(this.openKeys)) {
        this.openKeys.push(menu.key);
      }
      // 父菜单中包含关键字则显示所有的紫菜单
      if (menu.value.includes(search)) {
        search = undefined;
      }
      const children = menu.children
        .map(child => this.searchMenu(child, search, _search))
        .filter(child => child !== null);
      if (!search || menu.value.includes(search) || children.length > 0) {
        return { children, title, value: menu.value, key: menu.key };
      }
    } else {
      if (!search || menu.value.includes(search)) {
        return { title, value: menu.value, key: menu.key };
      }
    }
    return null;
  };

  render() {
    const { height } = document.getElementById('root').getBoundingClientRect();
    return (
      <Layout style={{ minHeight: '100vh', maxHeight: '100vh' }}>
        <Layout.Sider>
          <div
            style={{
              height: 40,
              background: '#fff',
              borderBottom: '1px solid #eee',
            }}
          >
            <Input
              className="search-input"
              placeholder="搜索..."
              prefix={<Icon type="search" />}
              onChange={this.onSearch}
            />
          </div>
          <Menu
            mode="inline"
            inlineIndent={12}
            style={{ height: height - 40, border: 'none' }}
            openKeys={this.state.openKeys}
            onOpenChange={this.onOpenChange}
          >
            {this.state.menus}
          </Menu>
        </Layout.Sider>
        <Layout.Content>
          <Tabs
            hideAdd
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onEdit}
            tabBarStyle={{ margin: 0 }}
          >
            {this.state.panes.map(pane => (
              <Tabs.TabPane tab={pane.title} key={pane.key}>
                {pane.content}
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Layout.Content>
      </Layout>
    );
  }
}
