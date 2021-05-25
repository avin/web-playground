// @process

// =================================

class CancelError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = 'CancelError'; // (2)
    }
}

function makeRequest(method, url) {
    const xhr = new XMLHttpRequest();

    const req = new Promise((resolve, reject) => {
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(new Error('Response status error'));
            }
        };
        xhr.onerror = function () {
            reject(new Error('Network error'));
        };

        xhr.addEventListener('abort', () => {
            reject(new CancelError('Canceled'));
        });

        xhr.send();
    });

    req.cancel = () => {
        xhr.abort();
    };

    return req;
}

const getResult = (value) => {
    return value;
};

// =================================

const inputEl = document.querySelector('#input');
const resultEl = document.querySelector('#result');

const showResult = (val) => {
    resultEl.innerHTML = val;
};

inputEl.addEventListener('input', (e) => {
    showResult(e.target.value);
});

// =================================
// SIMPLE
// =================================

let req;
document.querySelector('#start').addEventListener('click', async () => {
    req = makeRequest('GET', '/api/test1.do');
    const data = await req;

    showResult(data.result);
});

document.querySelector('#stop').addEventListener('click', async () => {
    req.cancel();
});

// =================================
// COMPLEX
// =================================

const cancelablePromise = (func) => {
    const reqObj = { req: undefined };
    const promise = func(reqObj);

    promise.cancel = () => {
        try {
            reqObj.req.cancel();
        } catch (e) {
            //
        }
    };

    return promise;
};

let promiseResult;
const doComplexShit = async () => {
    try {
        // Отменяем старые запросы
        if (promiseResult) {
            promiseResult.cancel();
        }

        // Шлем новые запросы по очереди

        promiseResult = cancelablePromise((reqObj) => {
            return (async () => {
                reqObj.req = makeRequest('GET', '/api/test1.do');
                const data1 = await reqObj.req;

                reqObj.req = makeRequest('GET', '/api/test2.do');
                const data2 = await reqObj.req;

                return 'cr=' + data1.result + data2.result;
            })();
        });
        await promiseResult;

        promiseResult = cancelablePromise((reqObj) => {
            return (async () => {
                reqObj.req = makeRequest('GET', '/api/test1.do');
                const data1 = await reqObj.req;

                reqObj.req = makeRequest('GET', '/api/test2.do');
                const data2 = await reqObj.req;

                return 'cr=' + data1.result + data2.result;
            })();
        });
        await promiseResult;
    } catch (e) {
        if (e instanceof CancelError) {
            console.log('canceled');
            return 123;
        }
        throw e;
    }
};

document.querySelector('#start-complex').addEventListener('click', async () => {
    try {
        const data = await doComplexShit();
        // console.log('NOT ERROR', data);
    } catch (e) {
        console.warn(e);
    }

    // showResult(data);
});

document.querySelector('#stop-complex').addEventListener('click', async () => {
    promiseResult.cancel();
});
