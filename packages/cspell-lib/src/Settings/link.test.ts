import { addPathsToGlobalImports, listGlobalImports, removePathsFromGlobalImports } from './link';
import Configstore from 'configstore';
// eslint-disable-next-line jest/no-mocks-import
import {
    clearData as clearConfigstore,
    setData as setConfigstore,
    clearMocks,
    mockSetData,
    getConfigstoreLocation,
} from '../__mocks__/configstore';

jest.mock('configstore');

const mockConfigstore = Configstore as jest.Mock<Configstore>;

const configFileLocation = getConfigstoreLocation();

describe('Validate Link.ts', () => {
    beforeEach(() => {
        mockConfigstore.mockClear();
        clearMocks();
        clearConfigstore();
    });

    test('listGlobalImports configstore empty', () => {
        const r = listGlobalImports();
        expect(r).toEqual({
            list: [],
            globalSettings: {
                source: { filename: configFileLocation, name: 'CSpell Configstore' },
            },
        });
        expect(mockSetData).not.toHaveBeenCalled();
    });

    test('listGlobalImports configstore empty import', () => {
        setConfigstore({
            import: [],
        });
        const r = listGlobalImports();
        expect(r).toEqual({
            list: [],
            globalSettings: {
                source: { filename: configFileLocation, name: 'CSpell Configstore' },
                import: [],
            },
        });
    });

    test('listGlobalImports with imports', () => {
        const python = require.resolve('cspell-dict-python/cspell-ext.json');
        setConfigstore({
            import: [python],
        });
        const r = listGlobalImports();
        expect(r).toEqual(
            expect.objectContaining({
                list: [
                    expect.objectContaining({
                        filename: python,
                        error: undefined,
                    }),
                ],
                globalSettings: expect.objectContaining({
                    source: { filename: configFileLocation, name: 'CSpell Configstore' },
                }),
            })
        );
    });

    test('listGlobalImports with import errors', () => {
        const filename = '__not_found_file_.ext';
        setConfigstore({
            import: [filename],
        });
        const r = listGlobalImports();
        expect(r).toEqual(
            expect.objectContaining({
                list: [
                    expect.objectContaining({
                        filename: filename,
                        error: expect.stringContaining('Failed to read config'),
                    }),
                ],
                globalSettings: expect.objectContaining({
                    source: { filename: configFileLocation, name: 'CSpell Configstore' },
                }),
            })
        );
        expect(mockSetData).not.toHaveBeenCalled();
    });

    test('addPathsToGlobalImports', () => {
        const pathPython = require.resolve('cspell-dict-python/cspell-ext.json');
        const pathCpp = require.resolve('cspell-dict-cpp/cspell-ext.json');
        const pathHtml = require.resolve('cspell-dict-html/cspell-ext.json');
        const pathCss = require.resolve('cspell-dict-css/cspell-ext.json');

        setConfigstore({
            import: [pathPython, pathCss],
        });

        const r = addPathsToGlobalImports([pathCpp, pathPython, pathHtml]);

        expect(r.resolvedSettings).toHaveLength(3);
        expect(r).toEqual({
            error: undefined,
            success: true,
            resolvedSettings: [
                expect.objectContaining({ filename: pathCpp, error: undefined }),
                expect.objectContaining({ filename: pathPython, error: undefined }),
                expect.objectContaining({ filename: pathHtml, error: undefined }),
            ],
        });
        expect(mockSetData).toHaveBeenCalledWith({
            import: [pathPython, pathCss, pathCpp, pathHtml],
        });
    });

    test('addPathsToGlobalImports with errors', () => {
        const pathPython = require.resolve('cspell-dict-python/cspell-ext.json');
        const pathCpp = require.resolve('cspell-dict-cpp/cspell-ext.json');
        const pathNotFound = '__not_found_file_.ext';

        setConfigstore({
            import: [pathPython],
        });

        const r = addPathsToGlobalImports([pathCpp, pathPython, pathNotFound]);

        expect(r.resolvedSettings).toHaveLength(3);
        expect(r).toEqual({
            error: 'Unable to resolve files.',
            success: false,
            resolvedSettings: [
                expect.objectContaining({ filename: pathCpp, error: undefined }),
                expect.objectContaining({ filename: pathPython, error: undefined }),
                expect.objectContaining({
                    filename: pathNotFound,
                    error: expect.stringContaining('Failed to read config'),
                }),
            ],
        });
        expect(mockSetData).not.toHaveBeenCalled();
    });

    test('removePathsFromGlobalImports', () => {
        const pathPython = require.resolve('cspell-dict-python/cspell-ext.json');
        const pathCpp = require.resolve('cspell-dict-cpp/cspell-ext.json');
        const pathHtml = require.resolve('cspell-dict-html/cspell-ext.json');
        const pathCss = require.resolve('cspell-dict-css/cspell-ext.json');

        setConfigstore({
            import: [pathCpp, pathPython, pathCss, pathHtml],
        });

        const r = removePathsFromGlobalImports([pathCpp, 'cspell-dict-css']);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [pathCpp, pathCss],
        });

        expect(mockSetData).toHaveBeenCalledWith({
            import: [pathPython, pathHtml],
        });
    });

    test('removePathsFromGlobalImports with unknown', () => {
        const pathPython = require.resolve('cspell-dict-python/cspell-ext.json');
        const pathCpp = require.resolve('cspell-dict-cpp/cspell-ext.json');
        const pathHtml = require.resolve('cspell-dict-html/cspell-ext.json');
        const pathCss = require.resolve('cspell-dict-css/cspell-ext.json');

        setConfigstore({
            import: [pathCpp, pathPython, pathCss, pathHtml],
        });

        const r = removePathsFromGlobalImports([
            pathCpp,
            'cspell-dict-unknown',
            'cspell-ext.json',
            'cspell-dict-html',
            'python/cspell-ext.json',
        ]);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [pathCpp, pathHtml],
        });

        expect(mockSetData).toHaveBeenCalledWith({
            import: [pathPython, pathCss],
        });
    });

    test('removePathsFromGlobalImports with nothing to remove', () => {
        const pathPython = require.resolve('cspell-dict-python/cspell-ext.json');
        const pathCpp = require.resolve('cspell-dict-cpp/cspell-ext.json');
        const pathHtml = require.resolve('cspell-dict-html/cspell-ext.json');
        const pathCss = require.resolve('cspell-dict-css/cspell-ext.json');

        setConfigstore({
            import: [pathCpp, pathPython, pathCss, pathHtml],
        });

        const r = removePathsFromGlobalImports(['cspell-dict-unknown', 'cspell-ext.json', 'python/cspell-ext.json']);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [],
        });

        expect(mockSetData).not.toHaveBeenCalled();
    });
});
