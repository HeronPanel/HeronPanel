package docker

import (
	"context"
	"fmt"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"io"
	"os"
)

type DockerManager struct {
	cli *client.Client
}

func NewDockerManager() (*DockerManager, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &DockerManager{cli: cli}, nil
}

func (m *DockerManager) CreateAndStart(serverId string, image string, ports map[string]string, memLimit int64) error {
	ctx := context.Background()

	// Pull image
	reader, err := m.cli.ImagePull(ctx, image, types.ImagePullOptions{})
	if err != nil {
		return err
	}
	io.Copy(os.Stdout, reader)

	// Configure Container
	config := &container.Config{
		Image: image,
		ExposedPorts: nil, // Should be mapped from ports
	}

	hostConfig := &container.HostConfig{
		Resources: container.Resources{
			Memory: memLimit * 1024 * 1024,
		},
	}

	resp, err := m.cli.ContainerCreate(ctx, config, hostConfig, nil, nil, serverId)
	if err != nil {
		return err
	}

	if err := m.cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	return nil
}

func (m *DockerManager) Stop(serverId string) error {
	ctx := context.Background()
	return m.cli.ContainerStop(ctx, serverId, container.StopOptions{})
}

func (m *DockerManager) Delete(serverId string) error {
	ctx := context.Background()
	return m.cli.ContainerRemove(ctx, serverId, types.ContainerRemoveOptions{Force: true})
}

func (m *DockerManager) GetLogs(serverId string) (io.ReadCloser, error) {
	ctx := context.Background()
	options := types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true}
	return m.cli.ContainerLogs(ctx, serverId, options)
}
