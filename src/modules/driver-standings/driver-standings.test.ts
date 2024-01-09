import { DriverDTO } from '../../models/types.dto';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';

describe('Test WDC functionality', () => {
  test('Test 2021 WDC results [season with sprint races]', async () => {
    const res = await getUrlResponseForTesting<
      {
        position: number;
        driver: DriverDTO;
        points: number;
        totalPoints: number;
      }[]
    >('/championships/2021/drivers', {});

    expect(res.find((x) => x.position == 1)?.driver.id).toBe('max-verstappen');
    expect(res.find((x) => x.position == 1)?.points).toBe(395.5);

    expect(res.find((x) => x.position == 2)?.driver.id).toBe('lewis-hamilton');
    expect(res.find((x) => x.position == 2)?.points).toBe(387.5);

    expect(res.find((x) => x.driver.id == 'esteban-ocon')?.points).toBe(74);
    expect(res.find((x) => x.driver.id == 'esteban-ocon')?.position).toBe(11);

    /* -- TIE RESOLVER-- */
    let driverRes = res.find((x) => x.driver.id == 'mick-schumacher');
    expect(driverRes?.points).toBe(0);
    expect(driverRes?.position).toBe(19);

    driverRes = res.find((x) => x.driver.id == 'robert-kubica');
    expect(driverRes?.points).toBe(0);
    expect(driverRes?.position).toBe(20);

    driverRes = res.find((x) => x.driver.id == 'nikita-mazepin');
    expect(driverRes?.points).toBe(0);
    expect(driverRes?.position).toBe(21);
  });

  test('Test 1967 WDC results [season where only the best N results counts]', async () => {
    const res = await getUrlResponseForTesting<
      {
        position: number;
        driver: DriverDTO;
        points: number;
        totalPoints: number;
      }[]
    >('/championships/1967/drivers', {});

    expect(res.find((x) => x.position == 1)?.driver.id).toBe('denny-hulme');
    expect(res.find((x) => x.position == 1)?.points).toBe(51);
    expect(res.find((x) => x.position == 1)?.totalPoints).toBe(51);

    expect(res.find((x) => x.position == 2)?.driver.id).toBe('jack-brabham');
    expect(res.find((x) => x.position == 2)?.points).toBe(46);
    expect(res.find((x) => x.position == 2)?.totalPoints).toBe(48);

    expect(res.find((x) => x.driver.id == 'mike-spence')?.points).toBe(9);
    expect(res.find((x) => x.driver.id == 'mike-spence')?.totalPoints).toBe(9);
    expect(res.find((x) => x.driver.id == 'mike-spence')?.position).toBe(10);

    /* -- TIE RESOLVER-- */
    let driverRes = res.find((x) => x.driver.id == 'bruce-mclaren');
    expect(driverRes?.points).toBe(3);
    expect(driverRes?.position).toBe(14);

    driverRes = res.find((x) => x.driver.id == 'jo-bonnier');
    expect(driverRes?.points).toBe(3);
    expect(driverRes?.position).toBe(15);
  });
});
