import { BiosimulationsConfigModule } from '@biosimulations/config/nest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'aws-sdk';
import { OutputFileName } from './datamodel';
import { FilePaths } from './file-paths';

describe('FilePaths', () => {
  let filePaths: FilePaths;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BiosimulationsConfigModule],
      providers: [FilePaths, ConfigService],
    }).compile();
    filePaths = module.get<FilePaths>(FilePaths);
  });

  it('Should be created', () => {
    expect(filePaths).toBeDefined();
  });

  it('should return correct path for output archive', () => {
    const runId = 'test-run-id';
    const expectedPath = 'outputs/output.zip';
    const path = filePaths.getSimulationRunOutputFilePath(
      runId,
      OutputFileName.OUTPUT_ARCHIVE,
      false,
    );
    expect(path).toEqual(expectedPath);
  });
  it('should return correct absolute path for output archive', () => {
    const runId = 'test-run-id';
    const expectedPath = 'simulations/test-run-id/outputs/output.zip';
    const path = filePaths.getSimulationRunOutputFilePath(
      runId,
      OutputFileName.OUTPUT_ARCHIVE,
      true,
    );
    expect(path).toEqual(expectedPath);
  });
  it('should return correct path for raw log', () => {
    const runId = 'test-run-id';
    const expectedPath = 'outputs/rawLog.txt';
    const path = filePaths.getSimulationRunOutputFilePath(
      runId,
      OutputFileName.RAW_LOG,
      false,
    );
    expect(path).toEqual(expectedPath);
  });
  it('should return correct path for structured Log', () => {
    const runId = 'test-run-id';
    const expectedPath = 'outputs/log.yml';
    const path = filePaths.getSimulationRunOutputFilePath(
      runId,
      OutputFileName.LOG,
      false,
    );
    expect(path).toEqual(expectedPath);
  });
  it('Should return correct S3 URL', () => {
    expect(filePaths.getSimulationRunFileContentEndpoint('x', 'file.txt')).toBe(
      'https://storage.googleapis.com/files.biosimulations.dev/simulations/x/contents/file.txt',
    );
  });

  it('Should return correct S3 filepath', () => {
    expect(
      filePaths.getSimulationRunContentFilePath('testSim', 'testFile'),
    ).toBe('simulations/testSim/contents/testFile');
  });
});
