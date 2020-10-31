export default {
  getOrigin,
  isDevTools,
};

export function getOrigin(): Promise<string> {
  return new Promise((res) => {
    if (isDevTools()) {
      chrome.devtools.inspectedWindow.eval("window.location.origin", res);
    } else {
      res('http://localhost:3000');
    }
  });
}

export function isDevTools() {
  return chrome && chrome.devtools;
}

export function getMockEvents() {
  return [
    {
      id: 123,
      duration: 434,
      request: {
        method: 'GET',
        href: 'https://example.com'
      }
    }
  ]
}